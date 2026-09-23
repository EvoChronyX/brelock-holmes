"""Protocol information API routes."""

from fastapi import APIRouter, HTTPException
from app.schemas import ProtocolInfo

router = APIRouter(prefix="/protocols", tags=["protocols"])

PROTOCOLS = {
    "teleportation_qds": ProtocolInfo(
        id="teleportation_qds",
        name="Teleportation-based QDS",
        description="Quantum Digital Signature protocol using quantum teleportation. "
                    "A message qubit is teleported via an entangled Bell pair, with "
                    "classical corrections applied based on Bell measurement outcomes. "
                    "The recovered state's measurement statistics serve as a quantum signature.",
        stages=[
            "State Preparation — Prepare message qubit in desired state",
            "Bell Pair Generation — Create entangled |Φ+⟩ pair",
            "Bell Measurement — Joint measurement on message + Alice's qubit",
            "Classical Communication — Send correction bits",
            "Pauli Correction — Apply X/Z corrections on Bob's qubit",
            "Verification Measurement — Measure recovered state",
            "Statistical Comparison — Compare observed vs expected distributions",
            "Threat Detection — Analyze deviations against calibrated thresholds",
        ],
        num_qubits=3,
    ),
}


@router.get("", response_model=list[ProtocolInfo])
async def list_protocols():
    return list(PROTOCOLS.values())


@router.get("/{protocol_id}", response_model=ProtocolInfo)
async def get_protocol(protocol_id: str):
    if protocol_id not in PROTOCOLS:
        raise HTTPException(404, "Protocol not found")
    return PROTOCOLS[protocol_id]
