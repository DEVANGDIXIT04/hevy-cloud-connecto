async function testSearch() {
  try {
    const response = await fetch("https://api.hevyapp.com/v1/exercise_templates?query=plank", {
      headers: { "api-key": "8163f083-4767-4124-b8d3-193bfb88a6d9" }
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
    const data = await response.json();
    
    console.log("Data type:", Array.isArray(data) ? "Array" : typeof data);
    if (!Array.isArray(data)) {
      console.log("Keys:", Object.keys(data));
      console.log("Page count:", data.page_count);
    }
    
    const query = "plank".toLowerCase();
    const results = (Array.isArray(data) ? data : data.exercise_templates || []).filter((ex) => (ex.title || "").toLowerCase().includes(query));
    
    console.log(`Found ${results.length} exercises matching 'plank':`);
    console.log(results.slice(0, 5).map((ex) => `- ${ex.title} (ID: ${ex.id})`).join("\n"));
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

testSearch();
