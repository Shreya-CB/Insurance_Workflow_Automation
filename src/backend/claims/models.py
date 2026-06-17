from app import db
class Claim(db.Model):
    __tablename__ = 'claims'
    claim_id = db.Column(db.Integer, primary_key=True)
    policy_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    incident_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    claim_amount = db.Column(db.Numeric(12,2))
    status = db.Column(db.String(30), default='Pending Review')
    assigned_adjuster_id = db.Column(db.Integer)
    evidence_url = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
