from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import psycopg
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
        "http://localhost:5500",
        "https://bright-smile-dental-smoky.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# DATABASE
# ==========================

DATABASE_URL = os.environ["DATABASE_URL"]


def get_connection():
    return psycopg.connect(
        DATABASE_URL,
        sslmode="require"
    )


def setup_database():

    with get_connection() as conn:

        with conn.cursor() as cursor:

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS appointments (
                    id BIGINT PRIMARY KEY,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT NOT NULL,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    service TEXT NOT NULL,
                    message TEXT DEFAULT '',
                    status TEXT NOT NULL,
                    "submittedAt" TEXT NOT NULL
                )
            """)

        conn.commit()


setup_database()


def load_appointments():

    with get_connection() as conn:

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT
                    id,
                    name,
                    phone,
                    email,
                    date,
                    time,
                    service,
                    message,
                    status,
                    "submittedAt"
                FROM appointments
                ORDER BY id
            """)

            rows = cursor.fetchall()

            columns = [
                "id",
                "name",
                "phone",
                "email",
                "date",
                "time",
                "service",
                "message",
                "status",
                "submittedAt"
            ]

            return [
                dict(zip(columns, row))
                for row in rows
            ]


def save_appointments(appointments):

    with get_connection() as conn:

        with conn.cursor() as cursor:

            cursor.execute(
                "DELETE FROM appointments"
            )

            for appointment in appointments:

                cursor.execute(
                    """
                    INSERT INTO appointments (
                        id,
                        name,
                        phone,
                        email,
                        date,
                        time,
                        service,
                        message,
                        status,
                        "submittedAt"
                    )
                    VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        appointment["id"],
                        appointment["name"],
                        appointment["phone"],
                        appointment["email"],
                        appointment["date"],
                        appointment["time"],
                        appointment["service"],
                        appointment["message"],
                        appointment["status"],
                        appointment["submittedAt"]
                    )
                )

        conn.commit()


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

@app.get("/api")
def home():

    return {
        "message": "BrightSmile Appointment API is running!"
    }


# ==========================
# TEST
# ==========================

@app.get("/api/test")
def test():

    return {
        "status": "success",
        "message": "BrightSmile backend is working!"
    }


# ==========================
# CREATE APPOINTMENT
# ==========================

@app.post("/api/appointments")
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

@app.get("/api/appointments")
def get_appointments():

    appointments = load_appointments()

    return {

        "status": "success",

        "appointments": appointments
    }


# ==========================
# UPDATE APPOINTMENT STATUS
# ==========================

@app.patch("/api/appointments/{appointment_id}/status")
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

@app.delete("/api/appointments")
def delete_all_appointments():

    save_appointments([])

    return {

        "status": "success",

        "message": "All appointments deleted."
    }