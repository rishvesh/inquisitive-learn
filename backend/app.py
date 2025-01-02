import os
import asyncio

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify, url_for
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from pypdf import PdfReader
from flask_cors import CORS  # Import CORS

from helpers import apology, login_required
from gemini import generate_questions_from_summary, summarize_pdf

# Configure application
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={
    r"/api/*": {"origins": "http://localhost:3000"}  # Replace with production URL when deploying
})  # Enable CORS for all routes (for development, you might want to be more specific)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
Session(app)

db = SQL("sqlite:///data.db")

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/api/index")  # Renamed and will return data, not a template
#@login_required
def index():
    username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]
    folders = db.execute("SELECT id, name, public FROM folders WHERE owner_id = ?", session["user_id"])
    return jsonify({"username": username, "folders": folders})

@app.route("/api/create_folder", methods=["POST"])
#@login_required
def create_folder():
    name = request.form.get("name")
    is_public = request.form.get("is_public") == "on"
    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    db.execute("INSERT INTO folders (owner_id, name, public) VALUES (?, ?, ?)",
               session["user_id"], name, 1 if is_public else 0)
    return jsonify({'message': 'Folder created successfully'}), 201  # Return success status

@app.route("/api/view_folder/<int:id>", methods=["GET"])  # Use a path parameter
#@login_required
def view_folder(id):
    qnas = db.execute("SELECT questions.question, questions.answer FROM questions INNER JOIN folder_copies ON questions.id = folder_copies.question_id WHERE folder_copies.folder_id = ?", id)
    return jsonify({"questions": [q["question"] for q in qnas], "answers": [q["answer"] for q in qnas]}), 200

@app.route("/api/public_folders", methods=["GET"])
def public_folders():
    search = request.args.get("search", "")
    folders = db.execute("""
        SELECT folders.id, folders.name, users.username
        FROM folders
        JOIN users ON folders.owner_id = users.id
        WHERE folders.public = 1 AND folders.name LIKE ?
        ORDER BY folders.name
    """, f"%{search}%")
    return jsonify(folders), 200

@app.route("/api/login", methods=["POST"])
def login():
   session.clear()
   data = request.get_json()

   if not data or not data.get("username"):
       return jsonify({"error": "Must provide username"}), 400
   elif not data.get("password"):
       return jsonify({"error": "Must provide password"}), 400

   rows = db.execute("SELECT * FROM users WHERE username = ?", data.get("username"))

   if len(rows) != 1 or not check_password_hash(rows[0]["hash"], data.get("password")):
       return jsonify({"error": "Invalid username and/or password"}), 401

   session["user_id"] = rows[0]["id"]
   return jsonify({"message": "Logged in successfully"}), 200

@app.route("/api/logout", methods=["POST"])  # Use POST for logging out
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route("/api/upload", methods=["GET"])
#@login_required
def upload():
    return jsonify({"message": "Upload route accessed"}), 200 # Or perhaps just remove this route if React handles the UI

@app.route("/api/generate_questions", methods=["POST"])
#@login_required
def generate_questions():
    app.logger.debug(f"Incoming form: {request.form}")
    app.logger.debug(f"Incoming files: {request.files}")
    app.logger.debug(f"Request files: {request.files}")
    uploaded_file = request.files['file']
    if not uploaded_file:
        return jsonify({"error": "No file uploaded."}), 400

    reader = PdfReader(uploaded_file)
    pdf_text = ""
    for page in reader.pages:
        pdf_text += page.extract_text()

    question_type_form = request.form['q-type']
    match question_type_form:
        case 'MCQ':
            question_type = 'multiple choice questions.'
        case 'VSA':
            question_type = 'very short answer questions in which one to two points are expected in the answer.'
        case 'SA':
            question_type = 'short answer questions in which two to four points are expected in the answer.'
        case 'LA':
            question_type = 'long answer questions in which five to six points are expected in the answer.'
        case 'CB':
            question_type = 'case based questions in which four questions are asked based on a passage, which may or may not be an extract from the chapter.'

    question_amount = request.form['q-amt']
    additional_requests = request.form['additional-requests']
    additional_requests = "Additional requests are: " + additional_requests if additional_requests else ""

    print("Summarizing PDF...")
    summary = summarize_pdf(pdf_text)

    if summary:
        print("Generating questions from summary...")
        json_response_text = generate_questions_from_summary(summary, question_type, question_amount, additional_requests)

        if json_response_text:
            try:
                import json

                start_index = json_response_text.find("```json")
                end_index = json_response_text.rfind("```")

                if start_index != -1 and end_index != -1 and start_index < end_index:
                    json_string = json_response_text[start_index + len("```json"):end_index].strip()
                    qna_list = json.loads(json_string)
                    print("Generated JSON:", qna_list)
                    session['qna_data'] = qna_list # Store the data in the session
                    return jsonify(qna_list), 200 # Return the generated questions directly
                else:
                    print("Could not find JSON markers in the response.")
                    return jsonify({"error": "Could not find valid JSON in the LLM response."}), 500

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(f"Problematic JSON string: {json_string}")
                return jsonify({"error": f"Failed to decode JSON response from LLM: {e}"}), 500
        else:
            return jsonify({"error": "Failed to generate questions."}), 500
    else:
        return jsonify({"error": "Failed to summarize the PDF."}), 500

@app.route("/api/get_generated_questions", methods=["GET"])
#@login_required
def get_generated_questions():
    qna_data = session.get('qna_data', [])
    return jsonify(qna_data), 200

@app.route("/api/register", methods=["POST"])
def register():
   data = request.get_json()
   name = data.get("username")

   for row in db.execute("SELECT username FROM users"):
       if name == row["username"]:
           return jsonify({"error": "Username already exists"}), 400

   password = data.get("password")
   confirmation = data.get("confirmation")

   if (not name) or (not password) or (not confirmation):
       return jsonify({"error": "Invalid username/password"}), 400

   if password != confirmation:
       return jsonify({"error": "Passwords do not match"}), 400

   db.execute(
       "INSERT INTO users (username, hash) VALUES(?, ?);",
       name,
       generate_password_hash(password),
   )
   # Log the user in immediately after registration
   user = db.execute("SELECT * FROM users WHERE username = ?", name)[0]
   session["user_id"] = user["id"]
   return jsonify({"message": "Registered successfully"}), 201

@app.route("/api/change_password", methods=["POST"])
#@login_required
def change_password():
   data = request.get_json()
   og = data.get("ogpassword")
   new = data.get("newpassword")
   conf = data.get("confirmation")

   if (not og) or (not new) or (not conf):
       return jsonify({"error": "Invalid password(s)"}), 400

   # Verify the old password
   user = db.execute("SELECT hash FROM users WHERE id = ?", session["user_id"])[0]
   if not check_password_hash(user["hash"], og):
       return jsonify({"error": "Incorrect original password"}), 400

   if new != conf:
       return jsonify({"error": "Passwords do not match"}), 400

   db.execute("UPDATE users SET hash = ? WHERE id = ?", generate_password_hash(new), session["user_id"])
   return jsonify({"message": "Password changed successfully"}), 200

@app.route("/api/test", methods=["GET"])
#@login_required
def test_response():
    return jsonify({"message": "Test endpoint reached"}), 200

@app.route("/api/getfolders", methods=["GET"])
#@login_required
def get_folders():
    public = False
    if request.args.get("public") == 'y':
        public = True

    limit = request.args.get("limit", default=10000, type=int)
    offset = request.args.get("offset", default=0, type=int)

    if not public:
        data = db.execute("SELECT id, name, public FROM folders WHERE owner_id == ? LIMIT ? OFFSET ?", session["user_id"], limit, offset)
    else:
        data = db.execute("SELECT folders.id, folders.name, users.username FROM folders LEFT JOIN users on folders.owner_id = users.id WHERE public == 1 ORDER BY RANDOM() LIMIT ? OFFSET ?", limit, offset)

    return jsonify(data), 200

@app.route("/api/pushfolder", methods=["POST"])
#@login_required
def pushFolder():
     data = request.get_json()  # Use get_json() for JSON requests

     if not data or not data.get('name'):
         return jsonify({"error": "Folder name is required"}), 400

     folderName = data.get('name')
     isPublic = data.get('public', 0)  # Default to private if not provided

     db.execute("INSERT INTO folders (owner_id, name, public, generative) VALUES(?, ?, ?, ?)",
            session["user_id"],
            folderName,
            isPublic,
            'TRUE')

     return jsonify({'message': 'Folder created successfully'}), 201

@app.route("/api/add_to_folder", methods=["POST"])
#@login_required
def add_to_folder():
    data = request.get_json()

    if not data or not all(key in data for key in ['question', 'answer', 'folder_id']):
        return jsonify({"error": "Missing required fields"}), 400

    question = data['question']
    answer = data['answer']
    folder_id = data['folder_id']

    # Check if the folder belongs to the current user
    folder = db.execute("SELECT * FROM folders WHERE id = ? AND owner_id = ?",
                        folder_id, session["user_id"])
    if not folder:
        return jsonify({"success": False, "message": "Folder not found or access denied"}), 403

    # Check if the question already exists in the database
    existing_question = db.execute("SELECT id FROM questions WHERE question = ? AND answer = ?",
                                   question, answer)

    if existing_question:
        question_id = existing_question[0]["id"]
    else:
        # If the question doesn't exist, insert it
        db.execute("INSERT INTO questions (question, answer) VALUES (?, ?)",
                   question, answer)
        question_id = db.execute("SELECT id FROM questions WHERE question = ? AND answer = ?",
                                 question, answer)[0]["id"]

    # Check if the question is already in the folder
    existing_in_folder = db.execute("SELECT * FROM folder_copies WHERE folder_id = ? AND question_id = ?",
                                   folder_id, question_id)

    if existing_in_folder:
        return jsonify({"success": False, "message": "Question already exists in the folder"}), 409

    # Add the question to the folder
    db.execute("INSERT INTO folder_copies (folder_id, question_id) VALUES (?, ?)",
               folder_id, question_id)

    return jsonify({"success": True, "message": "Question added to folder successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)