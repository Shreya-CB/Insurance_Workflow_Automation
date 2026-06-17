from .models import Claim
from app import db
def route_claim(claim_id):
    claim = Claim.query.get(claim_id)
    if not claim: return
    specialization = claim.incident_type or 'General'
    rs = db.session.execute("SELECT * FROM adjusters WHERE specialization = :s ORDER BY active_cases ASC LIMIT 1", {'s':specialization}).first()
    if not rs: return
    adjuster_id = rs.adjuster_id
    db.session.execute("UPDATE claims SET assigned_adjuster_id=:a, status='Under Review' WHERE claim_id=:c", {'a':adjuster_id,'c':claim_id})
    db.session.execute("UPDATE adjusters SET active_cases = active_cases + 1 WHERE adjuster_id=:a", {'a':adjuster_id})
    db.session.commit()
