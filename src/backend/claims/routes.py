from flask import Blueprint, request, current_app, jsonify
from .models import Claim
from app import db
from .routing import route_claim
import os

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/submit', methods=['POST'])
def submit_claim():
    f = request.files.get('evidence')
    filename = None
    if f:
        path = os.path.join(current_app.config['UPLOAD_DIR'], f.filename)
        f.save(path)
        filename = path
    claim = Claim(
       policy_id=request.form['policy_id'], user_id=request.form['user_id'],
       incident_type=request.form.get('incident_type'), description=request.form.get('description'),
       claim_amount=request.form.get('claim_amount'), evidence_url=filename
    )
    db.session.add(claim)
    db.session.commit()
    route_claim(claim.claim_id)
    return jsonify({'claim_id': claim.claim_id}), 201

@claims_bp.route('/decision/<int:claim_id>', methods=['PUT'])
def decision(claim_id):
    data = request.json
    claim = Claim.query.get_or_404(claim_id)
    if data['status'] == 'Approved':
        claim.status = 'Approved'
        # create payout entry - simple raw SQL or model
        db.session.execute("INSERT INTO payouts (claim_id,user_id,amount,status) VALUES (:c,:u,:a,'Processed')",
                           {'c':claim_id,'u':claim.user_id,'a':data.get('payout_amount')})
    else:
        claim.status = 'Rejected'
    db.session.commit()
    return jsonify({'message':'done'})
