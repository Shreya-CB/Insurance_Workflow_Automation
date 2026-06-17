from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__)
app.config.from_mapping({
  'SQLALCHEMY_DATABASE_URI': os.getenv('DATABASE_URL'),
  'SQLALCHEMY_TRACK_MODIFICATIONS': False,
  'UPLOAD_DIR': os.getenv('UPLOAD_DIR','uploads/claims')
})

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from claims.routes import claims_bp
app.register_blueprint(claims_bp, url_prefix='/api/claims')
