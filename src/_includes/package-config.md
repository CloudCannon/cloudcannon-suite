Available configuration options are as follows:

| Key | Use |
|-----|-----|{% for option in page.config_options %}
| **{{ option.key }}** | {{ option.use }} |{% endfor %}