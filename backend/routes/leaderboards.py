from flask import Blueprint, request, jsonify
from database import db
from models import GearItem, PlayerGear, Player, PlayerStat

bp = Blueprint('leaderboards', __name__)

ALLOWED_STATS = {
    'rushing_yards', 'rushing_tds', 'carries',
    'receiving_yards', 'receiving_tds', 'receptions', 'targets',
    'passing_yards', 'passing_tds', 'completions',
    'fg_made', 'fg_att', 'fg_long',
    'fantasy_points_ppr',
}

DEFAULT_STATS = {
    'helmet': 'rushing_yards',
    'cleats': 'rushing_yards',
    'gloves': 'receptions',
    'visor': 'receiving_yards',
    'facemask': 'rushing_yards',
}

STAT_CATEGORIES = {
    'rushing': 'rushing_yards',
    'passing': 'passing_yards',
    'receiving': 'receiving_yards',
    'kicking': 'fg_made',
    'defense': 'rushing_yards',
}

STAT_UNITS = {
    'rushing_yards': 'rushing yds',
    'passing_yards': 'passing yds',
    'receiving_yards': 'receiving yds',
    'fg_made': 'FG made',
    'rushing_tds': 'rush TDs',
    'receptions': 'receptions',
}


def _build_leaderboard_query(stat, season, week, category=None, limit=10):
    stat_col = getattr(PlayerStat, stat)
    query = (
        db.session.query(
            GearItem.id,
            GearItem.brand,
            GearItem.model,
            GearItem.category,
            GearItem.image_url,
            GearItem.affiliate_url,
            db.func.sum(stat_col).label('total_stat'),
            db.func.count(db.distinct(Player.id)).label('player_count'),
        )
        .join(PlayerGear, PlayerGear.gear_item_id == GearItem.id)
        .join(Player, Player.id == PlayerGear.player_id)
        .join(PlayerStat, PlayerStat.player_id == Player.id)
        .filter(PlayerStat.season == season)
        .filter(PlayerGear.season == season)
    )
    if category:
        query = query.filter(GearItem.category == category)
    if week is not None:
        query = query.filter(PlayerStat.week == week)
    return (
        query
        .group_by(GearItem.id)
        .order_by(db.desc('total_stat'))
        .limit(limit)
        .all()
    )


def _get_weekly_change(gear_id, stat, season, week):
    if week is not None:
        return 0
    stat_col = getattr(PlayerStat, stat)
    max_week = (
        db.session.query(db.func.max(PlayerStat.week))
        .filter(PlayerStat.season == season)
        .scalar()
    )
    if not max_week:
        return 0
    result = (
        db.session.query(db.func.sum(stat_col))
        .join(Player, Player.id == PlayerStat.player_id)
        .join(PlayerGear, PlayerGear.player_id == Player.id)
        .filter(PlayerGear.gear_item_id == gear_id)
        .filter(PlayerStat.season == season)
        .filter(PlayerStat.week == max_week)
        .filter(PlayerGear.season == season)
        .scalar()
    )
    return int(result or 0)


def _build_items(results, stat, season, week):
    stat_col = getattr(PlayerStat, stat)
    items = []
    for row in results:
        top_player_query = (
            db.session.query(
                Player.name,
                Player.team,
                db.func.sum(stat_col).label('player_stat'),
            )
            .join(PlayerGear, PlayerGear.player_id == Player.id)
            .join(PlayerStat, PlayerStat.player_id == Player.id)
            .filter(PlayerGear.gear_item_id == row.id)
            .filter(PlayerStat.season == season)
            .filter(PlayerGear.season == season)
        )
        if week is not None:
            top_player_query = top_player_query.filter(PlayerStat.week == week)
        top_player = (
            top_player_query
            .group_by(Player.id)
            .order_by(db.desc('player_stat'))
            .first()
        )
        weekly_change = _get_weekly_change(row.id, stat, season, week)
        items.append({
            'gear_id': row.id,
            'brand': row.brand,
            'model': row.model,
            'category': row.category,
            'image_url': row.image_url,
            'affiliate_url': row.affiliate_url,
            'total_stat': int(row.total_stat or 0),
            'stat_name': stat,
            'player_count': row.player_count,
            'weekly_change': weekly_change,
            'top_player': {
                'name': top_player.name,
                'team': top_player.team,
                'stat_value': int(top_player.player_stat or 0),
            } if top_player else None,
        })
    return items


@bp.route('/all')
def unified_leaderboard():
    stat_category = request.args.get('stat_category', 'rushing')
    stat = STAT_CATEGORIES.get(stat_category, 'rushing_yards')
    gear_type = request.args.get('gear_type')
    season = request.args.get('season', 2024, type=int)
    week = request.args.get('week', None, type=int)
    limit = request.args.get('limit', 20, type=int)

    results = _build_leaderboard_query(
        stat, season, week,
        category=gear_type if gear_type else None,
        limit=limit,
    )
    items = _build_items(results, stat, season, week)

    count_query = db.session.query(db.func.count(GearItem.id))
    if gear_type:
        count_query = count_query.filter(GearItem.category == gear_type)
    total_count = count_query.scalar()

    return jsonify({
        'stat_category': stat_category,
        'stat': stat,
        'stat_unit': STAT_UNITS.get(stat, stat.replace('_', ' ')),
        'season': season,
        'week': week,
        'gear_type': gear_type,
        'total_count': total_count,
        'items': items,
    })


@bp.route('/highlights')
def weekly_highlights():
    season = request.args.get('season', 2024, type=int)
    highlights = []
    configs = [
        ('rushing_yards', 'Most Rushing Yards', 'yds'),
        ('receptions', 'Most TDs Caught', 'rec'),
        ('fg_made', 'Most FGs Made', 'FG'),
        ('passing_yards', 'Most Passing Yards', 'yds'),
    ]
    for stat_name, label, unit in configs:
        stat_col = getattr(PlayerStat, stat_name)
        result = (
            db.session.query(
                GearItem.id,
                GearItem.brand,
                GearItem.model,
                GearItem.category,
                db.func.sum(stat_col).label('total_stat'),
            )
            .join(PlayerGear, PlayerGear.gear_item_id == GearItem.id)
            .join(Player, Player.id == PlayerGear.player_id)
            .join(PlayerStat, PlayerStat.player_id == Player.id)
            .filter(PlayerStat.season == season)
            .filter(PlayerGear.season == season)
            .group_by(GearItem.id)
            .order_by(db.desc('total_stat'))
            .first()
        )
        if result:
            value = int(result.total_stat or 0)
            highlights.append({
                'label': label,
                'gear_name': f"{result.brand} {result.model}",
                'gear_id': result.id,
                'category': result.category,
                'value': f"{value:,} {unit}",
                'raw_value': value,
            })
    return jsonify(highlights)


@bp.route('/<category>')
def leaderboard(category):
    stat = request.args.get('stat', DEFAULT_STATS.get(category, 'rushing_yards'))
    if stat not in ALLOWED_STATS:
        return jsonify({'error': f'Invalid stat. Allowed: {sorted(ALLOWED_STATS)}'}), 400
    season = request.args.get('season', 2024, type=int)
    week = request.args.get('week', None, type=int)
    limit = request.args.get('limit', 10, type=int)

    results = _build_leaderboard_query(stat, season, week, category=category, limit=limit)
    items = _build_items(results, stat, season, week)

    return jsonify({
        'leaderboard_title': f"Top {category.title()}s by {stat.replace('_', ' ').title()}",
        'season': season,
        'week': week,
        'stat': stat,
        'items': items,
    })
