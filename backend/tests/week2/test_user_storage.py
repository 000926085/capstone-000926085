import pytest
from fastapi.testclient import TestClient
from routes import app 
from supabase_client import supabase

client = TestClient(app)
TEST_USERNAME = "Kaisy"

@pytest.fixture(autouse=True)
def cleanup_test_user():
    def remove_user_data():
        user_res = (
            supabase.table("users")
            .select("user_id")
            .eq("username", TEST_USERNAME)
            .execute()
        )

        if user_res.data:
            user_id = user_res.data[0]["user_id"]
            supabase.table("user_genres_affinity").delete().eq("user_id", user_id).execute()
            supabase.table("user_tags_affinity").delete().eq("user_id", user_id).execute()
            supabase.table("user_studios_affinity").delete().eq("user_id", user_id).execute()
            supabase.table("users_anime").delete().eq("user_id", user_id).execute()
            supabase.table("users").delete().eq("user_id", user_id).execute()

    # Pre-test cleanup
    remove_user_data()

    yield

    # Post-test cleanup
    remove_user_data()

def test_import_user_stores_data_in_supabase():
    response = client.post(f"/api/import-anilist-user/{TEST_USERNAME}")
    assert response.status_code in [200, 201]
    print(f"\n [PASS] API Response Code: {response.status_code}")
    
    user_record = (
        supabase.table("users")
        .select("*")
        .eq("username", TEST_USERNAME)
        .execute()
    )

    # verify that the user was stored successfully.
    assert len(user_record.data) > 0, f"User {TEST_USERNAME} was not found in Supabase database."
    print(f" [PASS] Supabase User Record Retrieved: Found user '{TEST_USERNAME}'")

    stored_user = user_record.data[0]
    assert stored_user["username"] == TEST_USERNAME
    assert "last_updated" in stored_user
    assert stored_user["pfp"] is not None
    print(f" [PASS] Attributes Verified: Username, Last Updated, and PFP exist")

    anime_records = (
        supabase.table("users_anime")  
        .select("*, anime(*)")
        .eq("user_id", stored_user["user_id"])
        .execute()
    )

    assert len(anime_records.data) > 0, "No anime entries were linked to the user in the database."
    print(f" [PASS] Relational Anime Records Verified: {len(anime_records.data)} entries linked")