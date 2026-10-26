import os
import sys

# Ensure pdf_generators directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import gen_01_user_journeys
import gen_02_requirements
import gen_03_uml_architecture
import gen_04_security_ssdl
import gen_05_business_canvas_roadmap
import gen_06_presentation_deck
import gen_07_kanban_board
import gen_08_future_epics
import gen_09_limitations_rd

GENERATORS = [
    {
        "id": 1,
        "name": "User Journeys & Stories",
        "script": gen_01_user_journeys,
        "path": os.path.join(PROJECT_ROOT, "public", "user_journeys_and_stories", "Umkhuseli_User_Journeys_and_Stories_Final_MVP.pdf")
    },
    {
        "id": 2,
        "name": "Requirements Specification & Use Cases",
        "script": gen_02_requirements,
        "path": os.path.join(PROJECT_ROOT, "public", "requirements_and_use_cases", "Umkhuseli_Requirements_and_Use_Cases_Final_MVP.pdf")
    },
    {
        "id": 3,
        "name": "UML Diagrams & System Architecture",
        "script": gen_03_uml_architecture,
        "path": os.path.join(PROJECT_ROOT, "public", "uml_and_architecture", "Umkhuseli_UML_and_System_Architecture_Final_MVP.pdf")
    },
    {
        "id": 4,
        "name": "SSDL Security, Compliance & Governance",
        "script": gen_04_security_ssdl,
        "path": os.path.join(PROJECT_ROOT, "public", "security_and_ssdl", "Umkhuseli_SSDL_Security_Compliance_and_Governance_Final_MVP.pdf")
    },
    {
        "id": 5,
        "name": "Lean Business Canvas & Milestone Roadmap",
        "script": gen_05_business_canvas_roadmap,
        "path": os.path.join(PROJECT_ROOT, "public", "business_plan_and_roadmap", "Umkhuseli_Lean_Business_Canvas_and_Roadmap_Final_MVP.pdf")
    },
    {
        "id": 6,
        "name": "Executive Presentation Deck (7 Landscape Slides)",
        "script": gen_06_presentation_deck,
        "path": os.path.join(PROJECT_ROOT, "public", "presentation_deck", "Umkhuseli_Executive_Presentation_Deck_Final_MVP.pdf")
    },
    {
        "id": 7,
        "name": "Agile Kanban Board & Sprint Deliverables",
        "script": gen_07_kanban_board,
        "path": os.path.join(PROJECT_ROOT, "public", "kanban_board", "Umkhuseli_Kanban_Board_Final_MVP.pdf")
    },
    {
        "id": 8,
        "name": "Future Epics & Post-Hackathon Rollout",
        "script": gen_08_future_epics,
        "path": os.path.join(PROJECT_ROOT, "public", "future_epics_and_rollouts", "Umkhuseli_Future_Epics_and_Rollouts_Final_MVP.pdf")
    },
    {
        "id": 9,
        "name": "System Limitations, Threat Boundaries & R&D",
        "script": gen_09_limitations_rd,
        "path": os.path.join(PROJECT_ROOT, "public", "limitations_and_rd", "Umkhuseli_Limitations_and_RD_Final_MVP.pdf")
    }
]

def main():
    print("=" * 80)
    print("  UMKHUSELI: THE PROTECTOR • FINAL MVP PDF ARTIFACTS BUILDER")
    print("  FNB APP OF THE YEAR (AOTY) 2026 HACKATHON")
    print("=" * 80)

    results = []
    for gen in GENERATORS:
        print(f"\n[{gen['id']}/9] Building {gen['name']}...")
        out_file = gen['path']
        try:
            gen['script'].build_pdf(out_file)
            if os.path.exists(out_file):
                size_bytes = os.path.getsize(out_file)
                size_kb = size_bytes / 1024.0
                rel_path = os.path.relpath(out_file, PROJECT_ROOT).replace("\\", "/")
                results.append((gen['id'], gen['name'], rel_path, size_bytes, f"{size_kb:.2f} KB", "SUCCESS"))
                print(f"  --> OK: {rel_path} ({size_kb:.2f} KB)")
            else:
                results.append((gen['id'], gen['name'], gen['path'], 0, "0 KB", "FAILED - NOT FOUND"))
                print(f"  --> ERROR: File not created at {out_file}")
        except Exception as e:
            results.append((gen['id'], gen['name'], gen['path'], 0, "0 KB", f"ERROR: {str(e)}"))
            print(f"  --> EXCEPTION: {e}")

    print("\n" + "=" * 80)
    print("  FINAL MVP GENERATION SUMMARY SCORECARD")
    print("=" * 80)
    all_ok = True
    for res in results:
        status = res[5]
        if status != "SUCCESS":
            all_ok = False
        print(f"[{res[0]}] {res[1]:<45} | {res[4]:>10} | {status}")
        print(f"    Path: {res[2]}")

    if all_ok:
        print("\nAll 9 Final MVP PDFs generated successfully!")
    else:
        print("\nSome PDF generations failed. Check logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
