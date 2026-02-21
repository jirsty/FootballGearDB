from database import db


class Player(db.Model):
    __tablename__ = 'players'

    id = db.Column(db.Integer, primary_key=True)
    gsis_id = db.Column(db.Text, unique=True, nullable=False)
    name = db.Column(db.Text, nullable=False)
    team = db.Column(db.Text)
    position = db.Column(db.Text)
    headshot_url = db.Column(db.Text)

    gear_assignments = db.relationship('PlayerGear', back_populates='player')
    stats = db.relationship('PlayerStat', back_populates='player')


class GearItem(db.Model):
    __tablename__ = 'gear_items'
    __table_args__ = (
        db.UniqueConstraint('category', 'brand', 'model', name='uq_gear_identity'),
    )

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.Text, nullable=False)  # helmet, cleats, gloves, visor, facemask
    brand = db.Column(db.Text, nullable=False)
    model = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.Text)
    affiliate_url = db.Column(db.Text)
    affiliate_source = db.Column(db.Text)  # amazon, nike, dicks, etc.

    player_assignments = db.relationship('PlayerGear', back_populates='gear_item')


class PlayerGear(db.Model):
    __tablename__ = 'player_gear'
    __table_args__ = (
        db.UniqueConstraint('player_id', 'gear_item_id', 'season', name='uq_player_gear_season'),
    )

    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    gear_item_id = db.Column(db.Integer, db.ForeignKey('gear_items.id'), nullable=False)
    season = db.Column(db.Integer, nullable=False)
    source_note = db.Column(db.Text)

    player = db.relationship('Player', back_populates='gear_assignments')
    gear_item = db.relationship('GearItem', back_populates='player_assignments')


class PlayerStat(db.Model):
    __tablename__ = 'player_stats'
    __table_args__ = (
        db.UniqueConstraint('player_id', 'season', 'week', name='uq_player_season_week'),
    )

    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    season = db.Column(db.Integer, nullable=False)
    week = db.Column(db.Integer, nullable=False)
    season_type = db.Column(db.Text)
    completions = db.Column(db.Integer, default=0)
    attempts = db.Column(db.Integer, default=0)
    passing_yards = db.Column(db.Integer, default=0)
    passing_tds = db.Column(db.Integer, default=0)
    rushing_yards = db.Column(db.Integer, default=0)
    rushing_tds = db.Column(db.Integer, default=0)
    carries = db.Column(db.Integer, default=0)
    receptions = db.Column(db.Integer, default=0)
    targets = db.Column(db.Integer, default=0)
    receiving_yards = db.Column(db.Integer, default=0)
    receiving_tds = db.Column(db.Integer, default=0)
    fg_made = db.Column(db.Integer, default=0)
    fg_att = db.Column(db.Integer, default=0)
    fg_long = db.Column(db.Integer, default=0)
    fantasy_points_ppr = db.Column(db.Float, default=0.0)

    player = db.relationship('Player', back_populates='stats')
