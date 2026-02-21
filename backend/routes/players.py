from flask import Blueprint, request, jsonify
from database import db
from models import Player, PlayerGear, GearItem, PlayerStat

bp = Blueprint('players', __name__)


def _get_gear_rank(gear_id, category, stat, season):
    """Get a gear item's rank within its category for a given stat."""
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
            return i + 1, len(ranked), int(row.total_stat or 0)
    return None, len(ranked), 0


CATEGORY_PRIMARY_STAT = {
    'helmet': 'rushing_yards',
    'cleats': 'rushing_yards',
    'gloves': 'receiving_yards',
    'visor': 'receiving_yards',
    'facemask': 'rushing_yards',
}

STAT_LABELS = {
    'rushing_yards': 'rushing yds',
    'receiving_yards': 'receiving yds',
    'passing_yards': 'passing yds',
    'fg_made': 'FG made',
}


@bp.route('/')
def list_players():
    query = Player.query
    team = request.args.get('team')
    position = request.args.get('position')
    search = request.args.get('search')

    if team:
        query = query.filter_by(team=team)
    if position:
        query = query.filter_by(position=position)
    if search:
        query = query.filter(Player.name.ilike(f'%{search}%'))

    players = query.order_by(Player.name).all()

    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'team': p.team,
            'position': p.position,
            'headshot_url': p.headshot_url,
        }
        for p in players
    ])


@bp.route('/<int:player_id>')
def player_detail(player_id):
    player = db.get_or_404(Player, player_id)
    season = request.args.get('season', 2024, type=int)

    # Get gear for this player
    gear_items = (
        db.session.query(GearItem)
        .join(PlayerGear, PlayerGear.gear_item_id == GearItem.id)
        .filter(PlayerGear.player_id == player_id)
        .filter(PlayerGear.season == season)
        .all()
    )

    # Build gear list with rank info
    gear_with_ranks = []
    for g in gear_items:
        primary_stat = CATEGORY_PRIMARY_STAT.get(g.category, 'rushing_yards')
        rank, total, total_stat = _get_gear_rank(g.id, g.category, primary_stat, season)
        gear_with_ranks.append({
            'id': g.id,
            'category': g.category,
            'brand': g.brand,
            'model': g.model,
            'image_url': g.image_url,
            'affiliate_url': g.affiliate_url,
            'rank': rank,
            'total_in_category': total,
            'primary_stat': primary_stat,
            'primary_stat_label': STAT_LABELS.get(primary_stat, primary_stat),
            'total_stat_value': total_stat,
        })

    # Get weekly stats
    weekly_stats = (
        PlayerStat.query
        .filter_by(player_id=player_id, season=season)
        .order_by(PlayerStat.week)
        .all()
    )

    # Aggregate season totals
    season_totals = {}
    if weekly_stats:
        season_totals = {
            'season': season,
            'rushing_yards': sum(s.rushing_yards or 0 for s in weekly_stats),
            'rushing_tds': sum(s.rushing_tds or 0 for s in weekly_stats),
            'carries': sum(s.carries or 0 for s in weekly_stats),
            'receiving_yards': sum(s.receiving_yards or 0 for s in weekly_stats),
            'receiving_tds': sum(s.receiving_tds or 0 for s in weekly_stats),
            'receptions': sum(s.receptions or 0 for s in weekly_stats),
            'targets': sum(s.targets or 0 for s in weekly_stats),
            'passing_yards': sum(s.passing_yards or 0 for s in weekly_stats),
            'passing_tds': sum(s.passing_tds or 0 for s in weekly_stats),
            'completions': sum(s.completions or 0 for s in weekly_stats),
            'attempts': sum(s.attempts or 0 for s in weekly_stats),
            'fg_made': sum(s.fg_made or 0 for s in weekly_stats),
            'fg_att': sum(s.fg_att or 0 for s in weekly_stats),
            'fg_long': max((s.fg_long or 0 for s in weekly_stats), default=0),
            'fantasy_points_ppr': round(sum(s.fantasy_points_ppr or 0 for s in weekly_stats), 1),
        }

    return jsonify({
        'id': player.id,
        'name': player.name,
        'team': player.team,
        'position': player.position,
        'headshot_url': player.headshot_url,
        'gear': gear_with_ranks,
        'season_stats': season_totals,
        'weekly_stats': [
            {
                'week': s.week,
                'rushing_yards': s.rushing_yards or 0,
                'rushing_tds': s.rushing_tds or 0,
                'carries': s.carries or 0,
                'receiving_yards': s.receiving_yards or 0,
                'receiving_tds': s.receiving_tds or 0,
                'receptions': s.receptions or 0,
                'passing_yards': s.passing_yards or 0,
                'passing_tds': s.passing_tds or 0,
                'fg_made': s.fg_made or 0,
                'fantasy_points_ppr': s.fantasy_points_ppr or 0,
            }
            for s in weekly_stats
        ],
    })
