### Subtasks

{% for subtask in page.subtasks %}
#### {{ subtask.name }}

{{ subtask.desc }}

{% if subtask.code %}
```sh
$ {{ subtask.code }}
```
{% elsif subtask.lines_of_code %}
{% highlight sh %}
{% for line in subtask.lines_of_code %}$ {{ line }}
{% endfor %}
{% endhighlight %}
{% endif %}

{% endfor %}