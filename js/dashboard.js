// =====================================================
// BRIGHTSMILE ADMIN DASHBOARD
// =====================================================


// =====================================================
// BACKEND URL
// =====================================================

const API_URL =
    "https://bright-smile-dental-smoky.vercel.app/api/appointments";


// =====================================================
// DATA
// =====================================================

let appointments = [];

let currentFilter = "All";

let currentSearch = "";

let currentModalAppointment = null;


// =====================================================
// ELEMENTS
// =====================================================

const appointmentsBody =
    document.getElementById("appointments-body");

const emptyState =
    document.getElementById("empty-state");

const searchInput =
    document.getElementById("search-input");

const clearSearch =
    document.getElementById("clear-search");

const refreshBtn =
    document.getElementById("refresh-btn");

const logoutBtn =
    document.getElementById("logout-btn");

const clearAllBtn =
    document.getElementById("clear-all-btn");

const messageArea =
    document.getElementById("message-area");

const detailsModal =
    document.getElementById("details-modal");

const confirmModal =
    document.getElementById("confirm-modal");


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return escapeHTML(dateString);
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// =====================================================
// FORMAT SUBMITTED TIME
// =====================================================

function formatSubmitted(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return escapeHTML(value);
    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// =====================================================
// TODAY CHECK
// =====================================================

function isToday(dateString) {

    if (!dateString) {
        return false;
    }

    const today =
        new Date();

    const appointmentDate =
        new Date(dateString);

    return (
        today.getFullYear() ===
            appointmentDate.getFullYear() &&

        today.getMonth() ===
            appointmentDate.getMonth() &&

        today.getDate() ===
            appointmentDate.getDate()
    );
}


// =====================================================
// LOAD APPOINTMENTS
// =====================================================

async function loadAppointments() {

    if (refreshBtn) {
        refreshBtn.classList.add("loading");
    }

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        appointments =
            Array.isArray(data.appointments)
                ? data.appointments
                : [];


        console.log(
            "Appointments loaded:",
            appointments
        );


        updateStats();

        renderAppointments();


        showMessage(
            "Appointments refreshed successfully.",
            "success",
            false
        );


    } catch (error) {

        console.error(
            "Load appointments error:",
            error
        );


        appointmentsBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="error-cell"
                >

                    <i class="fas fa-circle-exclamation"></i>

                    Unable to load appointments.

                </td>

            </tr>

        `;


        showMessage(
            "Unable to connect to the appointment server.",
            "error"
        );


    } finally {

        if (refreshBtn) {

            refreshBtn.classList.remove(
                "loading"
            );

        }

    }
}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStats() {

    const total =
        appointments.length;


    const pending =
        appointments.filter(
            appointment =>
                appointment.status === "Pending"
        ).length;


    const confirmed =
        appointments.filter(
            appointment =>
                appointment.status === "Confirmed"
        ).length;


    const completed =
        appointments.filter(
            appointment =>
                appointment.status === "Completed"
        ).length;


    const today =
        appointments.filter(
            appointment =>
                isToday(appointment.date)
        ).length;


    const setText = (
        id,
        value
    ) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };


    setText(
        "total-appointments",
        total
    );


    setText(
        "pending-count",
        pending
    );


    setText(
        "confirmed-count",
        confirmed
    );


    setText(
        "completed-count",
        completed
    );


    setText(
        "today-count",
        today
    );


    setText(
        "all-filter-count",
        total
    );


    setText(
        "pending-filter-count",
        pending
    );


    setText(
        "confirmed-filter-count",
        confirmed
    );


    setText(
        "completed-filter-count",
        completed
    );

}


// =====================================================
// FILTER + SEARCH
// =====================================================

function getFilteredAppointments() {

    return appointments.filter(
        appointment => {

            const matchesFilter =
                currentFilter === "All" ||
                appointment.status === currentFilter;


            if (!currentSearch) {

                return matchesFilter;

            }


            const searchText =
                currentSearch.toLowerCase();


            const searchableText = [

                appointment.name,

                appointment.phone,

                appointment.email,

                appointment.age,

                appointment.gender,

                appointment.service,

                appointment.date,

                appointment.time,

                appointment.message

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return (
                matchesFilter &&
                searchableText.includes(
                    searchText
                )
            );

        }
    );
}


// =====================================================
// RENDER TABLE
// =====================================================

function renderAppointments() {

    const filtered =
        getFilteredAppointments();


    if (!filtered.length) {

        appointmentsBody.innerHTML = "";

        emptyState.classList.add(
            "show"
        );

        return;

    }


    emptyState.classList.remove(
        "show"
    );


    appointmentsBody.innerHTML =
        filtered
            .map(
                appointment => {

                    const status =
                        appointment.status ||
                        "Pending";


                    const statusClass =
                        status
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                "-"
                            );


                    const name =
                        escapeHTML(
                            appointment.name ||
                            "Patient"
                        );


                    const phone =
                        escapeHTML(
                            appointment.phone ||
                            ""
                        );


                    const email =
                        escapeHTML(
                            appointment.email ||
                            ""
                        );


                    const service =
                        escapeHTML(
                            appointment.service ||
                            "—"
                        );


                    const age =
                        escapeHTML(
                            appointment.age ||
                            ""
                        );


                    const gender =
                        escapeHTML(
                            appointment.gender ||
                            ""
                        );


                    const initials =
                        (
                            appointment.name ||
                            "P"
                        )
                            .charAt(0)
                            .toUpperCase();


                    return `

                        <tr>

                            <!-- PATIENT -->

                            <td>

                                <div class="patient-cell">

                                    <div class="patient-avatar">

                                        ${escapeHTML(initials)}

                                    </div>


                                    <div>

                                        <strong>
                                            ${name}
                                        </strong>

                                        <span>
                                            ${
                                                age
                                                    ? `${age} yrs`
                                                    : "Patient"
                                            }

                                            ${
                                                gender
                                                    ? ` • ${gender}`
                                                    : ""
                                            }
                                        </span>

                                    </div>

                                </div>

                            </td>



                            <!-- CONTACT -->

                            <td>

                                <div class="contact-cell">

                                    <span class="contact-phone">

                                        <i class="fas fa-phone"></i>

                                        ${phone || "—"}

                                    </span>


                                    <span class="contact-email">

                                        <i class="fas fa-envelope"></i>

                                        ${email || "—"}

                                    </span>

                                </div>

                            </td>



                            <!-- DATE + TIME -->

                            <td>

                                <div class="date-cell">

                                    <strong>

                                        ${formatDate(
                                            appointment.date
                                        )}

                                    </strong>


                                    <span>

                                        <i class="far fa-clock"></i>

                                        ${escapeHTML(
                                            appointment.time ||
                                            "—"
                                        )}

                                    </span>

                                </div>

                            </td>



                            <!-- SERVICE -->

                            <td>

                                <span class="service-badge">

                                    ${service}

                                </span>

                            </td>



                            <!-- STATUS -->

                            <td>

                                <select
                                    class="status-select status-${statusClass}"
                                    data-id="${escapeHTML(
                                        appointment.id
                                    )}"
                                >

                                    <option
                                        value="Pending"
                                        ${
                                            status ===
                                            "Pending"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Pending
                                    </option>


                                    <option
                                        value="Confirmed"
                                        ${
                                            status ===
                                            "Confirmed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Confirmed
                                    </option>


                                    <option
                                        value="Completed"
                                        ${
                                            status ===
                                            "Completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                </select>

                            </td>



                            <!-- SUBMITTED -->

                            <td>

                                <span class="submitted-time">

                                    ${formatSubmitted(
                                        appointment.submittedAt
                                    )}

                                </span>

                            </td>



                            <!-- VIEW -->

                            <td>

                                <button
                                    class="view-btn"
                                    data-id="${escapeHTML(
                                        appointment.id
                                    )}"
                                    type="button"
                                >

                                    <i class="fas fa-eye"></i>

                                    View

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    // =================================================
    // STATUS EVENTS
    // =================================================

    document
        .querySelectorAll(".status-select")
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    () => {

                        updateStatus(
                            select.dataset.id,
                            select.value
                        );

                    }
                );

            }
        );


    // =================================================
    // VIEW EVENTS
    // =================================================

    document
        .querySelectorAll(".view-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const appointment =
                            appointments.find(
                                item =>
                                    String(item.id) ===
                                    String(
                                        button.dataset.id
                                    )
                            );


                        if (appointment) {

                            openDetailsModal(
                                appointment
                            );

                        }

                    }
                );

            }
        );

}


// =====================================================
// UPDATE STATUS
// =====================================================

async function updateStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Status update failed."
            );

        }


        const data =
            await response.json();


        const appointment =
            appointments.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (appointment) {

            appointment.status =
                data.appointment?.status ||
                status;

        }


        updateStats();

        renderAppointments();


        showMessage(
            `Appointment marked as ${status}.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showMessage(
            "Unable to update appointment status.",
            "error"
        );

    }

}


// =====================================================
// DETAILS MODAL
// =====================================================

function openDetailsModal(
    appointment
) {

    currentModalAppointment =
        appointment;


    // PATIENT NAME

    document.getElementById(
        "modal-patient-name"
    ).textContent =
        appointment.name ||
        "Patient";


    // =================================================
    // AGE
    // =================================================

    document.getElementById(
        "modal-age"
    ).textContent =
        appointment.age ||
        "—";


    // =================================================
    // GENDER
    // =================================================

    document.getElementById(
        "modal-gender"
    ).textContent =
        appointment.gender ||
        "—";


    // =================================================
    // PHONE
    // =================================================

    document.getElementById(
        "modal-phone"
    ).textContent =
        appointment.phone ||
        "—";


    // =================================================
    // EMAIL
    // =================================================

    document.getElementById(
        "modal-email-address"
    ).textContent =
        appointment.email ||
        "—";


    // =================================================
    // DATE
    // =================================================

    document.getElementById(
        "modal-date"
    ).textContent =
        formatDate(
            appointment.date
        );


    // =================================================
    // TIME
    // =================================================

    document.getElementById(
        "modal-time"
    ).textContent =
        appointment.time ||
        "—";


    // =================================================
    // SERVICE
    // =================================================

    document.getElementById(
        "modal-service"
    ).textContent =
        appointment.service ||
        "—";


    // =================================================
    // STATUS
    // =================================================

    document.getElementById(
        "modal-status"
    ).textContent =
        appointment.status ||
        "Pending";


    // =================================================
    // MESSAGE
    // =================================================

    document.getElementById(
        "modal-message"
    ).textContent =
        appointment.message ||
        "No message provided.";


    // =================================================
    // EMAIL ACTION
    // =================================================

    const emailButton =
        document.getElementById(
            "modal-email"
        );


    if (emailButton) {

       if (appointment.email) {

    emailButton.href =
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(appointment.email)}`;

    emailButton.target = "_blank";
    emailButton.rel = "noopener noreferrer";

    emailButton.style.display =
        "inline-flex";

} else {

            emailButton.removeAttribute(
                "href"
            );

            emailButton.style.display =
                "none";

        }

    }


    // =================================================
    // SHOW MODAL
    // =================================================

    detailsModal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


// =====================================================
// CLOSE DETAILS MODAL
// =====================================================

function closeDetailsModal() {

    if (!detailsModal) {
        return;
    }

    detailsModal.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "modal-open"
    );

    currentModalAppointment =
        null;
}


// =====================================================
// OPEN CONFIRM MODAL
// =====================================================

function openConfirmModal() {

    if (!appointments.length) {

        showMessage(
            "There are no appointments to clear.",
            "info"
        );

        return;

    }


    confirmModal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


// =====================================================
// CLOSE CONFIRM MODAL
// =====================================================

function closeConfirmModal() {

    if (!confirmModal) {
        return;
    }

    confirmModal.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


// =====================================================
// CLEAR ALL APPOINTMENTS
// =====================================================

async function clearAllAppointments() {

    const confirmButton =
        document.getElementById(
            "confirm-clear"
        );


    confirmButton.disabled =
        true;


    confirmButton.innerHTML =
        `<i class="fas fa-spinner fa-spin"></i> Clearing...`;


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Clear failed."
            );

        }


        appointments = [];


        updateStats();

        renderAppointments();

        closeConfirmModal();


        showMessage(
            "All appointments have been cleared.",
            "success"
        );


    } catch (error) {

        console.error(
            "Clear all error:",
            error
        );


        showMessage(
            "Unable to clear appointments.",
            "error"
        );


    } finally {

        confirmButton.disabled =
            false;


        confirmButton.innerHTML =
            `<i class="fas fa-trash"></i> Clear Everything`;

    }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type = "success",
    autoHide = true
) {

    if (!messageArea) {
        return;
    }


    messageArea.innerHTML = `

        <div class="dashboard-message ${type}">

            <i class="${
                type === "success"
                    ? "fas fa-circle-check"
                    : type === "error"
                    ? "fas fa-circle-exclamation"
                    : "fas fa-circle-info"
            }"></i>

            <span>

                ${escapeHTML(message)}

            </span>

        </div>

    `;


    if (autoHide) {

        setTimeout(
            () => {

                messageArea.innerHTML = "";

            },
            3500
        );

    }

}


// =====================================================
// FILTER BUTTONS
// =====================================================

document
    .querySelectorAll(".filter-btn")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderAppointments();

                }
            );

        }
    );


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                searchInput.value.trim();

            renderAppointments();

        }
    );

}


// =====================================================
// CLEAR SEARCH
// =====================================================

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            currentSearch = "";

            renderAppointments();

            searchInput.focus();

        }
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadAppointments
    );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "brightSmileAdminLoggedIn"
            );

            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// MODAL CLOSE
// =====================================================

const modalClose =
    document.getElementById(
        "modal-close"
    );


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeDetailsModal
    );

}


// =====================================================
// CLEAR ALL
// =====================================================

if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        openConfirmModal
    );

}


// =====================================================
// CANCEL CLEAR
// =====================================================

const cancelClear =
    document.getElementById(
        "cancel-clear"
    );


if (cancelClear) {

    cancelClear.addEventListener(
        "click",
        closeConfirmModal
    );

}


// =====================================================
// CONFIRM CLEAR
// =====================================================

const confirmClear =
    document.getElementById(
        "confirm-clear"
    );


if (confirmClear) {

    confirmClear.addEventListener(
        "click",
        clearAllAppointments
    );

}


// =====================================================
// CLICK OUTSIDE DETAILS MODAL
// =====================================================

if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );

}


// =====================================================
// CLICK OUTSIDE CONFIRM MODAL
// =====================================================

if (confirmModal) {

    confirmModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                confirmModal
            ) {

                closeConfirmModal();

            }

        }
    );

}


// =====================================================
// ESCAPE KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeDetailsModal();

            closeConfirmModal();

        }

    }
);


// =====================================================
// INITIAL LOAD
// =====================================================

loadAppointments();