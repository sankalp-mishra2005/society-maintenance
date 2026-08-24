Society Maintenance Tracker 
Objective: 
• Apartment societies handle a steady stream of maintenance complaints, but without a proper system the admin has no way to see what is pending, what is overdue, or which issues keep coming back. Residents, meanwhile, have no visibility into progress. Build a platform where residents raise and track complaints with supporting photos, the admin manages them through a clear workflow with priorities, and everyone stays informed through a notice board and email updates. 
Scope of Work: 
• Input: Resident complaints with photos, admin status and priority updates, admin notices • Output: Tracked complaints with history, a notice board, and email updates to residents • Resident can register, log in, and raise a complaint with a category, description, and optional photo 
• Resident can view all their complaints with the full status history of each 
• Admin can view all complaints, filter by category, status, or date, and set a priority (Low, Medium, High) 
• Admin updates complaint status (Open, In Progress, Resolved); each change is recorded with a timestamp and an optional note 
• Once a complaint is marked Resolved, it is closed 
• Admin can flag a complaint as overdue if it stays open beyond a configurable number of days, and these surface at the top of the admin view 
• Admin can post notices to a notice board, optionally marking a notice as important so it is pinned to the top 
• Resident receives an email when their complaint status changes and when a new important notice is posted 
• Admin can view a simple dashboard: total complaints by status, by category, and count of overdue complaints 
Technical Expectations: 
• Backend API, Frontend, and Database with role-based auth (resident, admin) • Complaint status lifecycle with a recorded history of every change (timestamp, actor, note) • Photo upload handling for complaints 
• Overdue detection based on a configurable threshold 
• Notice board with pinned important notices 
• Email integration for status changes and important notices (any free tier service) 
Deliverables: 
1. Zip file with complete source code 
2. README with setup guide, .env.example, API docs, and database schema 3. Hosted application URL (Vercel, Render, Railway, or similar) 
4. System design write-up (800 words max) covering your complaint history model, overdue detection, photo handling, and notification flow 
Evaluation Focus: 
• Complaint lifecycle and status history design
• Overdue detection and priority handling • Photo upload and notice board design • Dashboard and reporting 
• Database schema, API design, and documentation