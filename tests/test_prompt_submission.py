from app.models import Prompt

from tests.conftest import assert_message_in_response


def _valid_prompt_data(**overrides):
    data = {
        "prompt-title": "Revision question generator",
        "categories": ["Education", "Writing"],
        "prompt-description": "Creates study questions from notes.",
        "prompt-body": "Read the notes and produce five exam-style questions.",
        "prompt-output": "Sample output text.",
    }
    data.update(overrides)
    return data


def test_submit_prompt_success_writes_to_database(auth_client, registered_user):
    response = auth_client.post(
        "/submit-prompt",
        data=_valid_prompt_data(),
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/submit-prompt" in response.location

    prompt = Prompt.query.one()
    assert prompt.title == "Revision question generator"
    assert prompt.category == "Education"
    assert prompt.subcategory == "Writing"
    assert prompt.description == "Creates study questions from notes."
    assert prompt.body == "Read the notes and produce five exam-style questions."
    assert prompt.output_preview == "Sample output text."
    assert prompt.author_id == registered_user.id


def test_submit_prompt_validation_missing_required_fields(auth_client):
    before = Prompt.query.count()

    response = auth_client.post(
        "/submit-prompt",
        data={
            "prompt-title": "",
            "categories": ["Writing"],
            "prompt-description": "",
            "prompt-body": "",
        },
        follow_redirects=False,
    )

    assert response.status_code == 200
    assert Prompt.query.count() == before
    assert_message_in_response(response, "Please complete all required fields.")


def test_submit_prompt_validation_no_categories(auth_client):
    before = Prompt.query.count()

    response = auth_client.post(
        "/submit-prompt",
        data=_valid_prompt_data(categories=[]),
        follow_redirects=False,
    )

    assert response.status_code == 200
    assert Prompt.query.count() == before
    assert_message_in_response(response, "Please select at least 1 category.")


def test_submit_prompt_validation_too_many_categories(auth_client):
    before = Prompt.query.count()

    response = auth_client.post(
        "/submit-prompt",
        data=_valid_prompt_data(
            categories=["Writing", "Education", "Coding", "Marketing"],
        ),
        follow_redirects=False,
    )

    assert response.status_code == 200
    assert Prompt.query.count() == before
    assert_message_in_response(response, "You can select up to 3 categories only.")


def test_submit_prompt_requires_login(client):
    response = client.post(
        "/submit-prompt",
        data=_valid_prompt_data(),
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/login" in response.location
    assert Prompt.query.count() == 0
