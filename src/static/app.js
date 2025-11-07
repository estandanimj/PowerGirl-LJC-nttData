document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear lista de participantes
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list" style="list-style: none; padding-left: 0;">
                ${details.participants.map(p => `
                  <li class="participant-item" style="display: flex; align-items: center; gap: 8px;">
                    <span>${p}</span>
                    <button class="delete-participant-btn" title="Eliminar" data-activity="${name}" data-email="${p}" style="background: none; border: none; cursor: pointer; color: #d32f2f; font-size: 1.1em;">
                      <span aria-hidden="true">&#128465;</span>
                    </button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section no-participants">
              <em>No participants yet.</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;


        activitiesList.appendChild(activityCard);

        // Delegar eventos de borrado de participantes
        activityCard.addEventListener("click", async (e) => {
          if (e.target.closest && e.target.closest(".delete-participant-btn")) {
            const btn = e.target.closest(".delete-participant-btn");
            const activity = btn.getAttribute("data-activity");
            const email = btn.getAttribute("data-email");
            if (confirm(`¿Eliminar a ${email} de ${activity}?`)) {
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "DELETE"
                });
                const result = await response.json();
                if (response.ok) {
                  fetchActivities();
                } else {
                  alert(result.detail || "No se pudo eliminar el participante.");
                }
              } catch (err) {
                alert("Error de red al eliminar participante.");
              }
            }
          }
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
  messageDiv.textContent = result.message;
  messageDiv.className = "success";
  signupForm.reset();
  fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
