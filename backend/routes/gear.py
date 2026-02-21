from flask import Blueprint, request, jsonify
from database import db
from models import GearItem, PlayerGear, Player, PlayerStat

bp = Blueprint('gear', __name__)


@bp.route('/')
def list_gear():
    category = request.args.get('category')
    season = request.args.get('season', 2024, type=int)
    query = GearItem.query
    if category:
        query = query.filter_by(category=category)
    items = query.order_by(GearItem.brand, GearItem.model).all()

    # Build rank lookup: {gear_id: (rank, total_in_category, primary_stat)}
    rank_lookup = _build_rank_lookup(season)

    result = []
    for g in items:
        info = rank_lookup.get(g.id, {})
        result.append({
            'id': g.id,
            'category': g.category,
            'brand': g.brand,
            'model': g.model,
            'image_url': g.image_url,
            'affiliate_url': g.affiliate_url,
            'rank': info.get('rank'),
            'total_in_category': info.get('total'),
            'primary_stat': info.get('stat'),
            'total_stat_value': info.get('stat_value'),
        })

    return jsonify(result)


STAT_LABELS = {
    'rushing_yards': 'rushing yds',
    'receiving_yards': 'receiving yds',
    'passing_yards': 'passing yds',
    'fg_made': 'FG made',
}


def _build_rank_lookup(season):
    """Build a dict of {gear_id: {rank, total, stat, stat_value}} for all categories."""
    lookup = {}
    for cat, stat in CATEGORY_PRIMARY_STAT.items():
        stat_col = getattr(PlayerStat, stat)
        ranked = (
            db.session.query(
                GearItem.id,
                db.func.sum(stat_col).label('total_stat'),
            )
            .join(PlayerGear, PlayerGear.gear_item_id == GearItem.id)
            .join(Player, Player.id == PlayerGear.player_id)
            .join(PlayerStat, PlayerStat.player_id == Player.id)
            .filter(GearItem.category == cat)
            .filter(PlayerStat.season == season)
            .filter(PlayerGear.season == season)
            .group_by(GearItem.id)
            .order_by(db.desc('total_stat'))
            .all()
        )
        total = len(ranked)
        for i, row in enumerate(ranked):
            lookup[row.id] = {
                'rank': i + 1,
                'total': total,
                'stat': STAT_LABELS.get(stat, stat),
                'stat_value': int(row.total_stat or 0),
            }
    return lookup


def _get_gear_rank(gear_id, category, stat, season):
    """Get this gear item's rank within its category for a given stat."""
    stat_col = getattr(PlayerStat, stat)
    ranked = (
        db.session.query(
            GearItem.id,
            db.func.sum(stat_col).label('total_stat'),
        )
        .join(PlayerGear, PlayerGear.gear_item_id == GearItem.id)
        .join(Player, Player.id == PlayerGear.player_id)
        .join(PlayerStat, PlayerStat.player_id == Player.id)
        .filter(GearItem.category == category)
        .filter(PlayerStat.season == season)
        .filter(PlayerGear.season == season)
        .group_by(GearItem.id)
        .order_by(db.desc('total_stat'))
        .all()
    )
    for i, row in enumerate(ranked):
        if row.id == gear_id:
            return i + 1, len(ranked)
    return None, len(ranked)


def _get_weekly_chart(player_ids, stat, season):
    """Get cumulative week-by-week data for the gear's aggregated stat."""
    stat_col = getattr(PlayerStat, stat)
    rows = (
        db.session.query(
            PlayerStat.week,
            db.func.sum(stat_col).label('week_total'),
        )
        .filter(PlayerStat.player_id.in_(player_ids))
        .filter(PlayerStat.season == season)
        .group_by(PlayerStat.week)
        .order_by(PlayerStat.week)
        .all()
    )
    chart_data = []
    cumulative = 0
    for row in rows:
        cumulative += int(row.week_total or 0)
        chart_data.append({
            'week': row.week,
            'weekly': int(row.week_total or 0),
            'cumulative': cumulative,
        })
    return chart_data


def _get_player_stats(player, season):
    """Get aggregated season stats for a single player."""
    row = (
        db.session.query(
            db.func.sum(PlayerStat.rushing_yards).label('rushing_yards'),
            db.func.sum(PlayerStat.receiving_yards).label('receiving_yards'),
            db.func.sum(PlayerStat.passing_yards).label('passing_yards'),
            db.func.sum(PlayerStat.rushing_tds).label('rushing_tds'),
            db.func.sum(PlayerStat.receiving_tds).label('receiving_tds'),
            db.func.sum(PlayerStat.passing_tds).label('passing_tds'),
            db.func.sum(PlayerStat.receptions).label('receptions'),
            db.func.sum(PlayerStat.fg_made).label('fg_made'),
            db.func.sum(PlayerStat.fantasy_points_ppr).label('fantasy_points'),
        )
        .filter(PlayerStat.player_id == player.id)
        .filter(PlayerStat.season == season)
        .first()
    )
    if not row:
        return {}
    return {
        'rushing_yards': int(row.rushing_yards or 0),
        'receiving_yards': int(row.receiving_yards or 0),
        'passing_yards': int(row.passing_yards or 0),
        'rushing_tds': int(row.rushing_tds or 0),
        'receiving_tds': int(row.receiving_tds or 0),
        'passing_tds': int(row.passing_tds or 0),
        'receptions': int(row.receptions or 0),
        'fg_made': int(row.fg_made or 0),
        'fantasy_points': round(float(row.fantasy_points or 0), 1),
    }


# Determine the "primary stat" for display based on gear category
CATEGORY_PRIMARY_STAT = {
    'helmet': 'rushing_yards',
    'cleats': 'rushing_yards',
    'gloves': 'receiving_yards',
    'visor': 'receiving_yards',
    'facemask': 'rushing_yards',
}


@bp.route('/<int:gear_id>')
def gear_detail(gear_id):
    gear = db.get_or_404(GearItem, gear_id)
    season = request.args.get('season', 2024, type=int)

    # Get players using this gear
    players = (
        db.session.query(Player)
        .join(PlayerGear, PlayerGear.player_id == Player.id)
        .filter(PlayerGear.gear_item_id == gear_id)
        .filter(PlayerGear.season == season)
        .all()
    )

    player_ids = [p.id for p in players]

    # Aggregate stats across all players using this gear
    stats_summary = {}
    if player_ids:
        row = (
            db.session.query(
                db.func.sum(PlayerStat.rushing_yards).label('total_rushing_yards'),
                db.func.sum(PlayerStat.receiving_yards).label('total_receiving_yards'),
                db.func.sum(PlayerStat.passing_yards).label('total_passing_yards'),
                db.func.sum(PlayerStat.rushing_tds).label('total_rushing_tds'),
                db.func.sum(PlayerStat.receiving_tds).label('total_receiving_tds'),
                db.func.sum(PlayerStat.passing_tds).label('total_passing_tds'),
                db.func.sum(PlayerStat.receptions).label('total_receptions'),
                db.func.sum(PlayerStat.fg_made).label('total_fg_made'),
            )
            .filter(PlayerStat.player_id.in_(player_ids))
            .filter(PlayerStat.season == season)
            .first()
        )
        if row:
            stats_summary = {
                'total_rushing_yards': int(row.total_rushing_yards or 0),
                'total_receiving_yards': int(row.total_receiving_yards or 0),
                'total_passing_yards': int(row.total_passing_yards or 0),
                'total_rushing_tds': int(row.total_rushing_tds or 0),
                'total_receiving_tds': int(row.total_receiving_tds or 0),
                'total_passing_tds': int(row.total_passing_tds or 0),
                'total_receptions': int(row.total_receptions or 0),
                'total_fg_made': int(row.total_fg_made or 0),
            }

    # Get rank within category
    primary_stat = CATEGORY_PRIMARY_STAT.get(gear.category, 'rushing_yards')
    rank, total_in_category = _get_gear_rank(gear_id, gear.category, primary_stat, season)

    # Get weekly chart data
    weekly_chart = _get_weekly_chart(player_ids, primary_stat, season) if player_ids else []

    # Get per-player stats
    players_with_stats = []
    for p in players:
        pstats = _get_player_stats(p, season)
        players_with_stats.append({
            'id': p.id,
            'name': p.name,
            'team': p.team,
            'position': p.position,
            'headshot_url': p.headshot_url,
            'stats': pstats,
        })

    # Sort players by the primary stat descending
    stat_key_map = {
        'rushing_yards': 'rushing_yards',
        'receiving_yards': 'receiving_yards',
        'passing_yards': 'passing_yards',
        'fg_made': 'fg_made',
    }
    sort_key = stat_key_map.get(primary_stat, 'rushing_yards')
    players_with_stats.sort(key=lambda p: p['stats'].get(sort_key, 0), reverse=True)

    # Get related gear in the same category
    related = (
        db.session.query(GearItem)
        .filter(GearItem.category == gear.category)
        .filter(GearItem.id != gear_id)
        .limit(4)
        .all()
    )

    return jsonify({
        'id': gear.id,
        'category': gear.category,
        'brand': gear.brand,
        'model': gear.model,
        'image_url': gear.image_url,
        'affiliate_url': gear.affiliate_url,
        'affiliate_source': gear.affiliate_source,
        'stats_summary': stats_summary,
        'rank': rank,
        'total_in_category': total_in_category,
        'primary_stat': primary_stat,
        'weekly_chart': weekly_chart,
        'players': players_with_stats,
        'related_gear': [
            {
                'id': g.id,
                'category': g.category,
                'brand': g.brand,
                'model': g.model,
                'affiliate_url': g.affiliate_url,
            }
            for g in related
        ],
    })
