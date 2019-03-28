---
title: Introduction
package: Dist
order_number: 1
---
The _Dist_ package allows you to make a clone of your site with a different baseurl. Your HTML and CSS files are rewritten to fix references to the new folder structure.

![](/images/gulp-dist.gif){: .demonstration}

### Features

* Build all your sites at `/` for consistency and clarity.
* Keep your `href` attributes free of Liquid - no `{% raw %}{{ site.baseurl }}{% endraw %}` everywhere.
* Use the [i18n package](/i18n/introduction) to create translated versions of your site, and sit them on different baseurls.
