"""Import player stats from nflverse CSV data into SQLite."""

import argparse
import os
import sys

import pandas as pd
import requests

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from database import db
from models import Player, PlayerStat

CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'cache')
STATS_URL = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_{year}.csv'
KICKING_URL = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_kicking_{year}.csv'

# Map nflverse CSV columns to our model columns
STAT_COLUMNS = {
    'completions': 'completions',
    'attempts': 'attempts',
    'passing_yards': 'passing_yards',
    'passing_tds': 'passing_tds',
    'rushing_yards': 'rushing_yards',
    'rushing_tds': 'rushing_tds',
    'carries': 'carries',
    'receptions': 'receptions',
    'targets': 'targets',
    'receiving_yards': 'receiving_yards',
    'receiving_tds': 'receiving_tds',
    'fantasy_points_ppr': 'fantasy_points_ppr',
}


def download_csv(url, cache_name, force=False):
    """Download a CSV from url, using cache if available."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_DIR, cache_name)

    if os.path.exists(cache_path) and not force:
        print(f"Using cached CSV: {cache_path}")
        return cache_path

    print(f"Downloading {url} ...")
    response = requests.get(url, timeout=60)
    response.raise_for_status()

    with open(cache_path, 'wb') as f:
        f.write(response.content)

    print(f"Saved to {cache_path} ({len(response.content) / 1024 / 1024:.1f} MB)")
    return cache_path


def _upsert_stat(player_id, season, week, season_type, stat_values):
    """Insert or update a player stat row. Returns ('imported' | 'updated')."""
    existing = PlayerStat.query.filter_by(
        player_id=player_id, season=season, week=week,
    ).first()

    if existing:
        for col, val in stat_values.items():
            setattr(existing, col, val)
        existing.season_type = season_type
        return 'updated'
    else:
        stat = PlayerStat(
            player_id=player_id, season=season, week=week,
            season_type=season_type, **stat_values,
        )
        db.session.add(stat)
        return 'imported'


def import_stats(year, force_download=False):
    """Import offensive + kicking stats for the given season."""
    # Get all players in our database
    players = Player.query.all()
    player_map = {p.gsis_id: p.id for p in players}
    print(f"Found {len(player_map)} players in database")

    # --- Offensive stats ---
    csv_path = download_csv(
        STATS_URL.format(year=year),
        f'player_stats_{year}.csv',
        force=force_download,
    )
    print("\nReading offensive stats CSV...")
    df = pd.read_csv(csv_path, low_memory=False)
    df = df[df['player_id'].isin(player_map.keys())].copy()
    print(f"Filtered to {len(df)} offensive stat rows for our players")

    imported = 0
    updated = 0
    for _, row in df.iterrows():
        player_id = player_map.get(row['player_id'])
        if not player_id:
            continue
        week = int(row.get('week', 0))
        if week == 0:
            continue

        stat_values = {}
        for csv_col, model_col in STAT_COLUMNS.items():
            val = row.get(csv_col, 0)
            if model_col == 'fantasy_points_ppr':
                stat_values[model_col] = float(val) if pd.notna(val) else 0.0
            else:
                stat_values[model_col] = int(val) if pd.notna(val) else 0

        result = _upsert_stat(
            player_id, int(row.get('season', year)), week,
            row.get('season_type', 'REG'), stat_values,
        )
        if result == 'imported':
            imported += 1
        else:
            updated += 1
        if (imported + updated) % 500 == 0:
            db.session.commit()

    db.session.commit()
    print(f"Offensive stats: {imported} imported, {updated} updated")

    # --- Kicking stats ---
    kick_path = download_csv(
        KICKING_URL.format(year=year),
        f'player_stats_kicking_{year}.csv',
        force=force_download,
    )
    print("\nReading kicking stats CSV...")
    kdf = pd.read_csv(kick_path, low_memory=False)
    kdf = kdf[kdf['player_id'].isin(player_map.keys())].copy()
    print(f"Filtered to {len(kdf)} kicking stat rows for our players")

    k_imported = 0
    k_updated = 0
    for _, row in kdf.iterrows():
        player_id = player_map.get(row['player_id'])
        if not player_id:
            continue
        week = int(row.get('week', 0))
        if week == 0:
            continue

        stat_values = {
            'fg_made': int(row['fg_made']) if pd.notna(row.get('fg_made')) else 0,
            'fg_att': int(row['fg_att']) if pd.notna(row.get('fg_att')) else 0,
            'fg_long': int(row['fg_long']) if pd.notna(row.get('fg_long')) else 0,
        }

        result = _upsert_stat(
            player_id, int(row.get('season', year)), week,
            row.get('season_type', 'REG'), stat_values,
        )
        if result == 'imported':
            k_imported += 1
        else:
            k_updated += 1

    db.session.commit()
    print(f"Kicking stats: {k_imported} imported, {k_updated} updated")
    print(f"\nTotal: {imported + k_imported} imported, {updated + k_updated} updated")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import nflverse player stats')
    parser.add_argument('--season', type=int, default=2024, help='Season year (default: 2024)')
    parser.add_argument('--force', action='store_true', help='Force re-download of CSV')
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        import_stats(args.season, force_download=args.force)
