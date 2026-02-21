from flask import Flask
from flask_cors import CORS
from config import Config
from database import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    from routes.leaderboards import bp as leaderboards_bp
    from routes.gear import bp as gear_bp
    from routes.players import bp as players_bp
    from routes.stats import bp as stats_bp

    app.register_blueprint(leaderboards_bp, url_prefix='/api/leaderboards')
    app.register_blueprint(gear_bp, url_prefix='/api/gear')
    app.register_blueprint(players_bp, url_prefix='/api/players')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
