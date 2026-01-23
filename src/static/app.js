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
      // Clear activitySelect dropdown to prevent duplicates
      activitySelect.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list safely using DOM methods
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        const participantsTitle = document.createElement("strong");
        participantsTitle.textContent = "Participants:";
        participantsSection.appendChild(participantsTitle);

        if (details.participants.length > 0) {
          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";
          details.participants.forEach(p => {
            const li = document.createElement("li");
            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;
            li.appendChild(nameSpan);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = "Unregister participant";
            deleteBtn.setAttribute("aria-label", `Delete participant ${p}`);
            deleteBtn.setAttribute("data-activity", name);
            deleteBtn.setAttribute("data-participant", p);
            deleteBtn.textContent = "🗑️";
            li.appendChild(deleteBtn);

            participantsList.appendChild(li);
          });
          participantsSection.appendChild(participantsList);
        } else {
          const noParticipants = document.createElement("p");
          noParticipants.className = "no-participants";
          noParticipants.textContent = "No participants yet.";
          participantsSection.appendChild(noParticipants);
        }

        // Build activity card content safely
        const h4 = document.createElement("h4");
        h4.textContent = name;
        const descP = document.createElement("p");
        descP.textContent = details.description;
        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(" " + details.schedule));
        const spotsP = document.createElement("p");
        const spotsStrong = document.createElement("strong");
        spotsStrong.textContent = "Availability:";
        spotsP.appendChild(spotsStrong);
        spotsP.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));

        activityCard.appendChild(h4);
        activityCard.appendChild(descP);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(spotsP);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown safely
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-participant-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const activity = btn.getAttribute('data-activity');
          const participant = btn.getAttribute('data-participant');
          if (confirm(`Unregister ${participant} from ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/remove?email=${encodeURIComponent(participant)}`, {
                method: 'POST',
              });
              if (response.ok) {
                fetchActivities();
              } else {
                alert('Failed to unregister participant. Please try again later.');
              }
            } catch (err) {
              console.error('Error occurred while unregistering participant:', err);
              alert('Failed to unregister participant. Please try again later.');
            }
          }
        });
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
        // Refresh activities list after successful signup
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
