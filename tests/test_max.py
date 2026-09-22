from bot.keyboards.inline import formats_keyboard, learn_style_keyboard, total_hours_keyboard

def flatten(kb):
    return [button for row in kb for button in row]

def test_max_callback_buttons_are_json_ready():
    buttons = flatten(learn_style_keyboard())
    assert len(buttons) == 4
    assert all(b["type"] == "callback" for b in buttons)
    assert all(b["payload"].startswith("lstyle_") for b in buttons)

def test_total_hours_buttons():
    buttons = flatten(total_hours_keyboard())
    assert len(buttons) == 5
    assert {b["payload"] for b in buttons} == {"hours_10", "hours_20", "hours_40", "hours_80", "hours_80plus"}

def test_book_format_is_available():
    buttons = flatten(formats_keyboard([]))
    assert any(b["payload"] == "toggle_fmt_book" for b in buttons)
