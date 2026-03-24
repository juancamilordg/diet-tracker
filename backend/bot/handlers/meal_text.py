"""
Text meal logging is handled within the photo_conv_handler in meal_photo.py.

The /log command is registered as an entry point in the same ConversationHandler
that handles photo uploads, since both flows share the same CONFIRM and CATEGORY
states.

See meal_photo.py for the full implementation:
- text_handler: entry point for /log <description>
- confirm_callback: handles Save/Edit/Cancel
- category_callback: handles meal category selection

The combined handler is exported as `photo_conv_handler` from meal_photo.py.
"""
