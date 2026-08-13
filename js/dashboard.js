// =====================================================
// BACKEND URL
// =====================================================

const API_URL = "https://bright-smile-dental-smoky.vercel.app";


// =====================================================
// APPOINTMENT DATA
// =====================================================

let appointments = [];

let currentFilter = "All";


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_URL}/appointments`
        );

        if (!response.ok) {
            throw new Error("Could not load appointments.");
        }

        const data = await response.json();

        appointments = data.appointments || [];

        updateStatistics();

        displayAppointments();

        hideError();

    } catch (error) {

        console.error(
            "Load appointments error:",
            error
        );

        showError(
            "Could not connect to the appointment server. Make sure the FastAPI backend is running."
        );

        appointments = [];

        updateStatistics();

        displayAppointments();
    }
}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    const totalAppointments =
        document.getElementById("totalAppointments");

    const todayAppointments =
        document.getElementById("todayAppointments");

    const totalPatients =
        document.getElementById("totalPatients");


    totalAppointments.textContent =
        appointments.length;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayCount =
        appointments.filter(
            appointment =>
                appointment.date === today
        ).length;


    todayAppointments.textContent =
        todayCount;


    const uniquePatients =
        new Set(
            appointments.map(
                appointment =>
                    appointment.phone
            )
        );


    totalPatients.textContent =
        uniquePatients.size;
}


// =====================================================
// DISPLAY APPOINTMENTS
// =====================================================

function displayAppointments() {

    const tableContainer =
        document.getElementById("appointmentTable");


    let filteredAppointments =
        appointments;


    if (currentFilter !== "All") {

        filteredAppointments =
            appointments.filter(
                appointment =>
                    (
                        appointment.status ||
                        "Pending"
                    ) === currentFilter
            );
    }


    if (filteredAppointments.length === 0) {

        tableContainer.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-calendar-xmark"></i>

                <h3>
                    No appointments found
                </h3>

                <p>
                    Appointment requests will appear here.
                </p>

            </div>

        `;

        return;
    }


    let tableHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>#</th>

                        <th>Patient</th>

                        <th>Phone</th>

                        <th>Email</th>

                        <th>Date</th>

                        <th>Time</th>

                        <th>Service</th>

                        <th>Status</th>

                    

                    </tr>

                </thead>

                <tbody>

    `;


    filteredAppointments.forEach(
        (appointment, index) => {

            const actualIndex =
                appointments.indexOf(
                    appointment
                );


            const status =
                appointment.status ||
                "Pending";


            let statusClass =
                "status-pending";


            if (status === "Confirmed") {

                statusClass =
                    "status-confirmed";
            }


            if (status === "Completed") {

                statusClass =
                    "status-completed";
            }


            tableHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>

                        <strong>
                            ${escapeHTML(
                                appointment.name || "-"
                            )}
                        </strong>

                    </td>


                    <td>
                        ${escapeHTML(
                            appointment.phone || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            appointment.email || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            appointment.date || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            appointment.time || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            appointment.service || "-"
                        )}
                    </td>


                    <td>

                        <select
                            class="status-select ${statusClass}"
                            onchange="
                                changeStatus(
                                    ${actualIndex},
                                    this.value,
                                    this
                                )
                            "
                        >

                            <option
                                value="Pending"
                                ${
                                    status === "Pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pending
                            </option>


                            <option
                                value="Confirmed"
                                ${
                                    status === "Confirmed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Confirmed
                            </option>


                            <option
                                value="Completed"
                                ${
                                    status === "Completed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Completed
                            </option>

                        </select>

                    </td>


                    <td>

                       

                    </td>

                </tr>

            `;
        }
    );


    tableHTML += `

                </tbody>

            </table>

        </div>

    `;


    tableContainer.innerHTML =
        tableHTML;
}


// =====================================================
// FILTER APPOINTMENTS
// =====================================================

function filterAppointments(
    filter,
    button
) {

    currentFilter =
        filter;


    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    displayAppointments();
}


// =====================================================
// CHANGE STATUS
// =====================================================

async function changeStatus(
    index,
    newStatus,
    selectElement
) {

    const appointment =
        appointments[index];


    if (!appointment) {
        return;
    }


    const oldStatus =
        appointment.status ||
        "Pending";


    selectElement.disabled = true;


    try {

        const response =
            await fetch(
                `${API_URL}/appointments/${appointment.id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Could not update appointment status."
            );
        }


        appointments[index] =
            data.appointment;


        updateStatistics();

        displayAppointments();


        showSuccess(
            `Appointment status changed to ${newStatus}.`
        );


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        selectElement.value =
            oldStatus;


        showError(
            "Could not update the appointment status. Make sure the FastAPI backend is running."
        );


    } finally {

        selectElement.disabled =
            false;
    }
}




// =====================================================
// CLEAR ALL APPOINTMENTS
// =====================================================

const clearAppointments =
    document.getElementById("clearAppointments");

if (clearAppointments) {

    clearAppointments.addEventListener(
        "click",
        async () => {

            if (appointments.length === 0) {

                alert(
                    "There are no appointments to clear."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete ALL appointments?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/appointments`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Could not delete appointments."
                    );
                }


                appointments = [];


                updateStatistics();

                displayAppointments();


                showSuccess(
                    "All appointments have been deleted."
                );


            } catch (error) {

                console.error(
                    "Delete all error:",
                    error
                );


                showError(
                    "Could not delete appointments from the server."
                );
            }

        }
    );

}
 
// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    const errorElement =
        document.getElementById(
            "errorMessage"
        );

    if (!errorElement) {
        return;
    }

    errorElement.textContent =
        message;

    errorElement.style.display =
        "block";
}


// =====================================================
// HIDE ERROR
// =====================================================

function hideError() {

    const errorElement =
        document.getElementById("errorMessage");


    errorElement.style.display =
        "none";
}


// =====================================================
// SHOW SUCCESS
// =====================================================

function showSuccess(message) {

    const successElement =
        document.getElementById(
            "successMessage"
        );

    if (!successElement) {
        return;
    }

    successElement.textContent =
        message;

    successElement.classList.add(
        "show"
    );

    setTimeout(
        () => {

            successElement.classList.remove(
                "show"
            );

        },
        2500
    );
}


// =====================================================
// LOGOUT
// =====================================================

function logoutAdmin() {

    sessionStorage.removeItem(
        "brightSmileAdminLoggedIn"
    );


    window.location.href =
        "login.html";
}


// =====================================================
// START DASHBOARD
// =====================================================

const appointmentTable =
    document.getElementById("appointmentTable");

if (appointmentTable) {
    loadDashboard();
}