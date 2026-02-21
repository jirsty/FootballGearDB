"""Seed the database with gear items and player-gear assignments from seed_data.json."""

import json
import os
import sys

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from database import db
from models import Player, GearItem, PlayerGear

SEED_FILE = os.path.join(os.path.dirname(__file__), 'seed_data.json')
SEASON = 2024


def seed():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Upsert gear items
    gear_lookup = {}  # (category, brand, model) -> GearItem
    for item in data['gear_items']:
        key = (item['category'], item['brand'], item['model'])
        existing = GearItem.query.filter_by(
            category=item['category'],
            brand=item['brand'],
            model=item['model'],
        ).first()
        if existing:
            existing.image_url = item.get('image_url')
            existing.affiliate_url = item.get('affiliate_url')
            existing.affiliate_source = item.get('affiliate_source')
            gear_lookup[key] = existing
        else:
            gi = GearItem(
                category=item['category'],
                brand=item['brand'],
                model=item['model'],
                image_url=item.get('image_url'),
                affiliate_url=item.get('affiliate_url'),
                affiliate_source=item.get('affiliate_source'),
            )
            db.session.add(gi)
            gear_lookup[key] = gi

    db.session.flush()  # Assign IDs to new gear items
    print(f"Loaded {len(gear_lookup)} gear items")

    # 2. Upsert players and create gear assignments
    player_count = 0
    assignment_count = 0
    for p_data in data['players']:
        player = Player.query.filter_by(gsis_id=p_data['gsis_id']).first()
        if player:
            player.name = p_data['name']
            player.team = p_data['team']
            player.position = p_data['position']
            player.headshot_url = p_data.get('headshot_url')
        else:
            player = Player(
                gsis_id=p_data['gsis_id'],
                name=p_data['name'],
                team=p_data['team'],
                position=p_data['position'],
                headshot_url=p_data.get('headshot_url'),
            )
            db.session.add(player)
        db.session.flush()
        player_count += 1

        # Create gear assignments
        for gear_ref in p_data.get('gear', []):
            key = (gear_ref['category'], gear_ref['brand'], gear_ref['model'])
            gear_item = gear_lookup.get(key)
            if not gear_item:
                print(f"  WARNING: Gear not found: {key} for {p_data['name']}")
                continue

            existing_assignment = PlayerGear.query.filter_by(
                player_id=player.id,
                gear_item_id=gear_item.id,
                season=SEASON,
            ).first()
            if not existing_assignment:
                pg = PlayerGear(
                    player_id=player.id,
                    gear_item_id=gear_item.id,
                    season=SEASON,
                    source_note='Initial seed data',
                )
                db.session.add(pg)
                assignment_count += 1

    db.session.commit()
    print(f"Loaded {player_count} players with {assignment_count} new gear assignments")


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed()
