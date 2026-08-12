from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import json
from datetime import datetime


# ==========================
# APP
# ==========================

app = FastAPI(
    title="BrightSmile Appointment API",
    version="1.0.0"
)


# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# DATABASE FILE
# ==========================

DATABASE_FILE = Path("appointments.json")


# ==========================
# DATABASE FUNCTIONS
# ==========================

def load_appointments():

    if not DATABASE_FILE.exists():
        return []

    try:

        with open(
            DATABASE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except (json.JSONDecodeError, OSError):

        return []


def save_appointments(appointments):

    with open(
        DATABASE_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            appointments,
            file,
            indent=4,
            ensure_ascii=False
        )


# ==========================
# APPOINTMENT MODEL
# ==========================

class Appointment(BaseModel):

    name: str

    phone: str

    email: str

    date: str

    time: str

    service: str

    message: str = ""


# ==========================
# STATUS MODEL
# ==========================

class StatusUpdate(BaseModel):

    status: str


# ==========================
# HOME
# ==========================

@app.get("/")
def home():

    return {
        "message": "BrightSmile Appointment API is running!"
    }


# ==========================
# TEST
# ==========================

@app.get("/test")
def test():

    return {
        "status": "success",
        "message": "BrightSmile backend is working!"
    }


# ==========================
# CREATE APPOINTMENT
# ==========================

@app.post("/appointments")
def create_appointment(
    appointment: Appointment
):

    appointments = load_appointments()

    new_appointment = {

        "id": int(
            datetime.now().timestamp() * 1000
        ),

        "name": appointment.name,

        "phone": appointment.phone,

        "email": appointment.email,

        "date": appointment.date,

        "time": appointment.time,

        "service": appointment.service,

        "message": appointment.message,

        "status": "Pending",

        "submittedAt": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    appointments.append(
        new_appointment
    )

    save_appointments(
        appointments
    )

    return {

        "status": "success",

        "message": "Appointment request received!",

        "appointment": new_appointment
    }


# ==========================
# GET ALL APPOINTMENTS
# ==========================

@app.get("/appointments")
def get_appointments():

    appointments = load_appointments()

    return {

        "status": "success",

        "appointments": appointments
    }


# ==========================
# UPDATE APPOINTMENT STATUS
# ==========================

@app.patch("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    status_update: StatusUpdate
):

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Completed"
    ]

    if status_update.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid appointment status."
        )


    appointments = load_appointments()


    for appointment in appointments:

        if appointment["id"] == appointment_id:

            appointment["status"] = (
                status_update.status
            )

            save_appointments(
                appointments
            )

            return {

                "status": "success",

                "message": "Appointment status updated.",

                "appointment": appointment
            }


    raise HTTPException(
        status_code=404,
        detail="Appointment not found."
    )




# ==========================
# DELETE ALL APPOINTMENTS
# ==========================

@app.delete("/appointments")
def delete_all_appointments():

    save_appointments([])

    return {

        "status": "success",

        "message": "All appointments deleted."
    } 
