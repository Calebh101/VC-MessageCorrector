# About

This plugin is very simple; it reorders messages based on their timestamps. This might *seem* useless, but it's really not. (in my humble opinion)

Basically, I've found that the client's message pool just kinda receives a message (whether from itself, or from the server) and just accepts it. But this creates some inconsistencies; if you and someone else send a message at around the same time, at least one of the clients will show a different order than the server received it.

This plugin basically uses the timestamps of each message, and sorts them how they should be. Each message's timestamp represents when the server received it.

# Authors

- Calebh101
