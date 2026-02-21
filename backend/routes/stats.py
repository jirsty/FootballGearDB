from flask import Blueprint, jsonify
from database import db
from models import PlayerStat

bp = Blueprint('stats', __name__)


@bp.route('/weeks')
def available_weeks():
    rows = (
        db.session.query(
            PlayerStat.season,
            PlayerStat.week,
        )
        .distinct()
        .order_by(PlayerStat.season, PlayerStat.week)
        .all()
    )

    seasons = {}
    for row in rows:
        s = str(row.season)
        if s not in seasons:
            seasons[s] = []
        if row.week not in seasons[s]:
            seasons[s].append(row.week)

    return jsonify({
        'seasons': sorted(seasons.keys()),
        'weeks': seasons,
    })
