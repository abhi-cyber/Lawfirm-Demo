import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";
import Client from "./models/Client";
import Case from "./models/Case";
import Task, {ITask} from "./models/Task";
import connectDB from "./config/db";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Cleaning database...");
    await User.deleteMany({});
    await Client.deleteMany({});
    await Case.deleteMany({});
    await Task.deleteMany({});

    console.log("Creating users...");
    const users = await User.create([
      {
        name: "Margaret Chen",
        email: "mchen@hartfordlegal.com",
        role: "partner",
        specialties: ["Corporate Law", "Mergers & Acquisitions"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Margaret+Chen&background=6366f1&color=fff",
      },
      {
        name: "David Richardson",
        email: "drichardson@hartfordlegal.com",
        role: "partner",
        specialties: ["Commercial Litigation", "Employment Law"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=David+Richardson&background=8b5cf6&color=fff",
      },
      {
        name: "Michael Torres",
        email: "mtorres@hartfordlegal.com",
        role: "associate",
        specialties: ["Contract Law", "Intellectual Property"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Michael+Torres&background=06b6d4&color=fff",
      },
      {
        name: "Sarah Mitchell",
        email: "smitchell@hartfordlegal.com",
        role: "paralegal",
        specialties: ["Legal Research", "Document Review"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=10b981&color=fff",
      },
      {
        name: "Robert Nakamura",
        email: "rnakamura@hartfordlegal.com",
        role: "partner",
        specialties: ["Real Estate", "Corporate Finance"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Robert+Nakamura&background=f59e0b&color=fff",
      },
      {
        name: "Jennifer Walsh",
        email: "jwalsh@hartfordlegal.com",
        role: "staff",
        specialties: ["Office Administration", "Client Relations"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Jennifer+Walsh&background=ec4899&color=fff",
      },
      {
        name: "Amanda Foster",
        email: "afoster@hartfordlegal.com",
        role: "associate",
        specialties: ["Family Law", "Estate Planning"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=Amanda+Foster&background=14b8a6&color=fff",
      },
      {
        name: "James Patterson",
        email: "jpatterson@hartfordlegal.com",
        role: "paralegal",
        specialties: ["Case Management", "Court Filings"],
        avatarUrl:
          "https://ui-avatars.com/api/?name=James+Patterson&background=f97316&color=fff",
      },
    ]);

    console.log("Creating clients...");
    const clients = await Client.create([
      {
        name: "Meridian Manufacturing Inc.",
        companyName: "Meridian Manufacturing Inc.",
        email: "legal@meridianmfg.com",
        phone: "(312) 555-0147",
        status: "active",
        totalMatters: 3,
        notes: [
          {
            content:
              "Long-standing client since 2019. Primary contact is CFO William Hayes. Prefers email communication for non-urgent matters.",
            author: "Margaret Chen",
            createdAt: new Date(Date.now() - 86400000 * 30),
          },
          {
            content:
              "Annual contract review scheduled for Q2. Discuss potential expansion of retainer agreement.",
            author: "David Richardson",
            createdAt: new Date(Date.now() - 86400000 * 7),
          },
        ],
      },
      {
        name: "Elizabeth Hartwell",
        email: "ehartwell@gmail.com",
        phone: "(312) 555-0198",
        status: "active",
        totalMatters: 1,
        notes: [
          {
            content:
              "Referred by existing client James Morrison. Seeking estate planning services for family trust.",
            author: "Amanda Foster",
            createdAt: new Date(Date.now() - 86400000 * 14),
          },
        ],
      },
      {
        name: "Global Tech Solutions LLC",
        companyName: "Global Tech Solutions LLC",
        email: "contracts@globaltechsolutions.com",
        phone: "(415) 555-0234",
        status: "active",
        totalMatters: 2,
        notes: [
          {
            content:
              "Fast-growing SaaS company. CEO Sandra Kim is primary decision maker. Very responsive to communications.",
            author: "Michael Torres",
            createdAt: new Date(Date.now() - 86400000 * 21),
          },
        ],
      },
      {
        name: "Northstar Capital Partners",
        companyName: "Northstar Capital Partners",
        email: "legal@northstarcap.com",
        phone: "(212) 555-0312",
        status: "prospect",
        totalMatters: 0,
        notes: [
          {
            content:
              "Initial consultation completed. Interested in M&A advisory services for upcoming acquisition. Follow up scheduled for next week.",
            author: "Margaret Chen",
            createdAt: new Date(Date.now() - 86400000 * 3),
          },
        ],
      },
      {
        name: "Riverside Healthcare Group",
        companyName: "Riverside Healthcare Group",
        email: "compliance@riversidehg.org",
        phone: "(617) 555-0456",
        status: "inactive",
        totalMatters: 5,
        notes: [
          {
            content:
              "Completed regulatory compliance project in 2023. May re-engage for upcoming HIPAA audit preparation.",
            author: "David Richardson",
            createdAt: new Date(Date.now() - 86400000 * 90),
          },
        ],
      },
      {
        name: "Summit Real Estate Development",
        companyName: "Summit Real Estate Development",
        email: "jthompson@summitred.com",
        phone: "(303) 555-0567",
        status: "active",
        totalMatters: 4,
        notes: [
          {
            content:
              "Managing partner John Thompson handles all legal matters. Currently working on three commercial property acquisitions.",
            author: "Robert Nakamura",
            createdAt: new Date(Date.now() - 86400000 * 10),
          },
        ],
      },
      {
        name: "Marcus Williams",
        email: "mwilliams.attorney@outlook.com",
        phone: "(404) 555-0678",
        status: "active",
        totalMatters: 1,
        notes: [
          {
            content:
              "Employment dispute case. Client is former VP of Sales at regional company. Strong documentation of wrongful termination claim.",
            author: "David Richardson",
            createdAt: new Date(Date.now() - 86400000 * 5),
          },
        ],
      },
      {
        name: "Pacific Coast Logistics",
        companyName: "Pacific Coast Logistics",
        email: "legal@pclogistics.com",
        phone: "(206) 555-0789",
        status: "prospect",
        totalMatters: 0,
        notes: [
          {
            content:
              "Referral from Summit Real Estate. Looking for contract review services for vendor agreements. Sent engagement letter.",
            author: "Michael Torres",
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
        ],
      },
      {
        name: "Catherine Reynolds",
        email: "creynolds@reynoldsfamily.net",
        phone: "(312) 555-0890",
        status: "inactive",
        totalMatters: 2,
        notes: [
          {
            content:
              "Estate planning completed in 2022. Annual review due in 6 months. Send reminder in Q3.",
            author: "Amanda Foster",
            createdAt: new Date(Date.now() - 86400000 * 180),
          },
        ],
      },
    ]);

    console.log("Creating cases...");
    const cases = await Case.create([
      {
        title: "Contract Dispute - Vendor Agreement",
        caseNumber: "MM-2024-001",
        client: clients[0]._id, // Meridian Manufacturing
        assignedTeam: [users[1]._id, users[2]._id], // David Richardson, Michael Torres
        status: "discovery",
        priority: "high",
        stage: "In Progress",
        description:
          "Breach of contract dispute with primary supplier regarding delivery terms and quality standards. Seeking damages for production delays.",
        deadline: new Date(Date.now() + 86400000 * 30),
      },
      {
        title: "Acquisition Due Diligence - Midwest Metals",
        caseNumber: "MM-2024-002",
        client: clients[0]._id, // Meridian Manufacturing
        assignedTeam: [users[0]._id, users[4]._id], // Margaret Chen, Robert Nakamura
        status: "intake",
        priority: "high",
        stage: "To Do",
        description:
          "Comprehensive due diligence review for proposed acquisition of Midwest Metals Corp. Includes asset review, liability assessment, and regulatory compliance.",
      },
      {
        title: "Hartwell Family Trust Establishment",
        caseNumber: "EH-2024-001",
        client: clients[1]._id, // Elizabeth Hartwell
        assignedTeam: [users[6]._id, users[3]._id], // Amanda Foster, Sarah Mitchell
        status: "discovery",
        priority: "medium",
        stage: "In Progress",
        description:
          "Establishment of irrevocable family trust for estate planning purposes. Includes asset transfer documentation and beneficiary designations.",
        deadline: new Date(Date.now() + 86400000 * 45),
      },
      {
        title: "Software Licensing Agreement Review",
        caseNumber: "GTS-2024-001",
        client: clients[2]._id, // Global Tech Solutions
        assignedTeam: [users[2]._id], // Michael Torres
        status: "discovery",
        priority: "medium",
        stage: "Review",
        description:
          "Review and negotiation of enterprise software licensing agreement with major technology vendor. Focus on IP rights and liability limitations.",
        deadline: new Date(Date.now() + 86400000 * 14),
      },
      {
        title: "Employment Discrimination Defense",
        caseNumber: "GTS-2024-002",
        client: clients[2]._id, // Global Tech Solutions
        assignedTeam: [users[1]._id, users[7]._id], // David Richardson, James Patterson
        status: "trial",
        priority: "high",
        stage: "In Progress",
        description:
          "Defense against employment discrimination claim filed by former employee. Case involves alleged wrongful termination and hostile work environment.",
      },
      {
        title: "M&A Advisory - Target Acquisition",
        caseNumber: "NCP-2024-001",
        client: clients[3]._id, // Northstar Capital Partners
        assignedTeam: [users[0]._id, users[4]._id], // Margaret Chen, Robert Nakamura
        status: "intake",
        priority: "medium",
        stage: "To Do",
        description:
          "Advisory services for proposed acquisition of regional manufacturing company. Includes valuation review and deal structure recommendations.",
      },
      {
        title: "Williams v. Regional Sales Corp",
        caseNumber: "MW-2024-001",
        client: clients[6]._id, // Marcus Williams
        assignedTeam: [users[1]._id, users[3]._id], // David Richardson, Sarah Mitchell
        status: "discovery",
        priority: "high",
        stage: "In Progress",
        description:
          "Wrongful termination lawsuit on behalf of former VP of Sales. Claims include breach of employment contract and retaliation for whistleblowing.",
        deadline: new Date(Date.now() + 86400000 * 60),
      },
      {
        title: "Commercial Property Acquisition - Downtown Plaza",
        caseNumber: "SRE-2024-001",
        client: clients[5]._id, // Summit Real Estate
        assignedTeam: [users[4]._id, users[7]._id], // Robert Nakamura, James Patterson
        status: "discovery",
        priority: "medium",
        stage: "Review",
        description:
          "Legal support for acquisition of mixed-use commercial property. Includes title review, environmental assessment, and lease assumption analysis.",
        deadline: new Date(Date.now() + 86400000 * 21),
      },
      {
        title: "Zoning Variance Application",
        caseNumber: "SRE-2024-002",
        client: clients[5]._id, // Summit Real Estate
        assignedTeam: [users[4]._id], // Robert Nakamura
        status: "intake",
        priority: "low",
        stage: "To Do",
        description:
          "Preparation and filing of zoning variance application for proposed residential development project.",
      },
      {
        title: "Reynolds Estate Administration",
        caseNumber: "CR-2023-001",
        client: clients[8]._id, // Catherine Reynolds
        assignedTeam: [users[6]._id], // Amanda Foster
        status: "closed",
        priority: "low",
        stage: "Done",
        description:
          "Administration of estate following passing of spouse. Included probate proceedings and asset distribution to beneficiaries.",
      },
      {
        title: "HIPAA Compliance Audit",
        caseNumber: "RHG-2023-001",
        client: clients[4]._id, // Riverside Healthcare
        assignedTeam: [users[1]._id, users[3]._id], // David Richardson, Sarah Mitchell
        status: "closed",
        priority: "medium",
        stage: "Done",
        description:
          "Comprehensive HIPAA compliance audit and remediation plan development. Identified and addressed data security vulnerabilities.",
      },
    ]);

    console.log("Creating tasks...");
    await Task.create([
      {
        title: "Draft Response to Discovery Requests",
        description:
          "Prepare responses to interrogatories and document requests for Meridian contract dispute case MM-2024-001",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 3), // 3 days
        assignedTo: users[2]._id, // Michael Torres
        relatedCase: cases[0]._id, // Contract Dispute - Vendor Agreement
        priority: "high",
      },
      {
        title: "Review Target Company Financials",
        description:
          "Analyze financial statements and identify potential liabilities for Midwest Metals acquisition due diligence",
        status: "in-progress",
        dueDate: new Date(Date.now() + 86400000 * 7),
        assignedTo: users[0]._id, // Margaret Chen
        relatedCase: cases[1]._id, // Acquisition Due Diligence
        priority: "high",
      },
      {
        title: "Draft Trust Agreement",
        description:
          "Prepare initial draft of irrevocable family trust document for Hartwell estate planning matter",
        status: "in-progress",
        dueDate: new Date(Date.now() + 86400000 * 10),
        assignedTo: users[6]._id, // Amanda Foster
        relatedCase: cases[2]._id, // Hartwell Family Trust
        priority: "medium",
      },
      {
        title: "Research Employment Discrimination Precedents",
        description:
          "Identify relevant case law and statutory defenses for Global Tech employment discrimination defense",
        status: "completed",
        dueDate: new Date(Date.now() - 86400000 * 2),
        assignedTo: users[3]._id, // Sarah Mitchell
        relatedCase: cases[4]._id, // Employment Discrimination Defense
        priority: "high",
      },
      {
        title: "Prepare Witness Deposition Outline",
        description:
          "Draft deposition questions for key witnesses in Williams wrongful termination case",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 5),
        assignedTo: users[1]._id, // David Richardson
        relatedCase: cases[6]._id, // Williams v. Regional Sales Corp
        priority: "high",
      },
      {
        title: "Review Software License Terms",
        description:
          "Analyze IP provisions and liability clauses in proposed software licensing agreement for Global Tech",
        status: "in-progress",
        dueDate: new Date(Date.now() + 86400000 * 4),
        assignedTo: users[2]._id, // Michael Torres
        relatedCase: cases[3]._id, // Software Licensing Agreement Review
        priority: "medium",
      },
      {
        title: "Client Meeting - M&A Strategy",
        description:
          "Initial strategy meeting with Northstar Capital Partners regarding acquisition approach and deal structure",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 2),
        assignedTo: users[0]._id, // Margaret Chen
        relatedCase: cases[5]._id, // M&A Advisory - Target Acquisition
        priority: "medium",
      },
      {
        title: "Title Search Review",
        description:
          "Review title search results and identify any encumbrances for Downtown Plaza acquisition",
        status: "completed",
        dueDate: new Date(Date.now() - 86400000 * 5),
        assignedTo: users[7]._id, // James Patterson
        relatedCase: cases[7]._id, // Commercial Property Acquisition
        priority: "medium",
      },
      {
        title: "Prepare Zoning Application Documents",
        description:
          "Compile and organize documentation package for Summit Real Estate zoning variance application",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 14),
        assignedTo: users[4]._id, // Robert Nakamura
        relatedCase: cases[8]._id, // Zoning Variance Application
        priority: "low",
      },
      {
        title: "Schedule Expert Witness Consultation",
        description:
          "Coordinate meeting with financial expert witness for damages assessment in vendor contract dispute",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 6),
        assignedTo: users[5]._id, // Jennifer Walsh
        relatedCase: cases[0]._id, // Contract Dispute - Vendor Agreement
        priority: "medium",
      },
      {
        title: "File Court Discovery Motion",
        description:
          "Prepare and file motion to compel discovery responses in Williams employment case",
        status: "completed",
        dueDate: new Date(Date.now() - 86400000 * 3),
        assignedTo: users[7]._id, // James Patterson
        relatedCase: cases[6]._id, // Williams v. Regional Sales Corp
        priority: "high",
      },
      {
        title: "Update Trust Beneficiary Records",
        description:
          "Finalize beneficiary designations and update client records for Hartwell Family Trust",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 12),
        assignedTo: users[3]._id, // Sarah Mitchell
        relatedCase: cases[2]._id, // Hartwell Family Trust
        priority: "low",
      },
    ]);

    console.log("Data seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
