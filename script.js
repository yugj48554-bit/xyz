document.getElementById("analyzeBtn").addEventListener("click", analyze);

async function analyze() {
  const skills = document.getElementById("skills").value;

  if (!skills.trim()) {
    document.getElementById("result").innerText = "Please enter at least one skill.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ skills })
    });

    const data = await res.json();
    document.getElementById("result").innerText = data.message;

  } catch (error) {
    document.getElementById("result").innerText =
      "⚠️ Backend not running. Start the server first.";
  }
}

