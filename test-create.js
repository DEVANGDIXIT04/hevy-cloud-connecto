async function testUpdate() {
  const payload = {
    title: "Test Routine Updated",
    folder_id: null,
    exercises: [
      {
        exercise_template_id: "07B38369",
        sets: [
          { type: "normal", weight_kg: 25, reps: 12 }
        ]
      }
    ]
  };

  try {
    const res = await fetch("https://api.hevyapp.com/v1/routines/95d0b82b-5ca5-4a8e-8033-ae81245a2d0d", {
      method: "PUT",
      headers: {
        "api-key": "8163f083-4767-4124-b8d3-193bfb88a6d9",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ routine: payload })
    });
    
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error(err);
  }
}

testUpdate();
