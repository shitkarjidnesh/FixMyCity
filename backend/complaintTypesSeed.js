const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ComplaintTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subComplaints: [{ type: String }],
});

const ComplaintType = mongoose.model("ComplaintType", ComplaintTypeSchema);

const complaintTypes = [
  {
    name: "Road Issues",
    subComplaints: [
      "Potholes",
      "Broken footpath",
      "Blocked drainage",
      "Street flooding",
    ],
  },
  {
    name: "Streetlight Problems",
    subComplaints: [
      "Light not working",
      "Flickering streetlight",
      "Broken pole",
      "Exposed wiring",
    ],
  },
  {
    name: "Garbage and Cleanliness",
    subComplaints: [
      "Uncollected garbage",
      "Overflowing dustbins",
      "Littering in public places",
      "Dead animal removal",
    ],
  },
  {
    name: "Water Supply",
    subComplaints: [
      "No water supply",
      "Water leakage",
      "Low water pressure",
      "Contaminated water",
    ],
  },
  {
    name: "Electricity",
    subComplaints: [
      "Power outage",
      "Faulty transformer",
      "Fallen wires",
      "Voltage fluctuation",
    ],
  },
  {
    name: "Public Property Damage",
    subComplaints: [
      "Broken benches",
      "Damaged signboards",
      "Wall graffiti",
      "Damaged park equipment",
    ],
  },
  {
    name: "Sewage Problems",
    subComplaints: [
      "Sewage overflow",
      "Clogged drains",
      "Bad odour",
      "Leakage from manholes",
    ],
  },
];

async function insertComplaintTypes() {
  try {
    await ComplaintType.deleteMany(); // Optional: Clear old entries
    const result = await ComplaintType.insertMany(complaintTypes);
    console.log("Complaint types inserted successfully:");
    console.table(
      result.map((c) => ({
        name: c.name,
        subComplaints: c.subComplaints.length,
      }))
    );
  } catch (err) {
    console.error("Error inserting complaint types:", err);
  } finally {
    mongoose.connection.close();
  }
}

insertComplaintTypes();
