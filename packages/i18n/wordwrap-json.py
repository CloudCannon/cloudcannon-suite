#!/usr/bin/python
# coding: utf-8

import budou
import sys
import json

reload(sys)
sys.setdefaultencoding('utf8')

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print "Required arguments:"
        print "[0] = credentials_filename"
        print "[1] = locale_filename"
        print "[2] = output_filename"
        sys.exit()

    credentials_filename = sys.argv[1].decode("utf-8")
    locale_filename = sys.argv[2].decode("utf-8")
    output_filename = sys.argv[3].decode("utf-8")

    # Login to Cloud Natural Language API with credentials
    parser = budou.authenticate(credentials_filename)

    # Login to Cloud Natural Language API with credentials
    print('Authenticating...')
    sys.stdout.flush()

    parser = budou.authenticate(credentials_filename)
    print('Done')
    sys.stdout.flush()

    print('Processing...')
    sys.stdout.flush()

    data = {}
    with open(locale_filename) as input_file:
        content = input_file.read()
        parsed_json = json.loads(content)

        # lines = f.readlines()
        for key, translation in parsed_json.items():
            # Check for HTML
            if "</" in translation or "meta:" in key:
                data[key] = translation
            elif translation:
                result = parser.parse(unicode(translation), attributes={'class': 'wordwrap'})
                html = result['html_code']
                data[key] = html[6:-7].replace('\n', ' ').replace('\r', '')

        input_file.close()

    print('Done')
    print('Saving...')
    sys.stdout.flush()

    with open(output_filename, "w") as outfile:
        json.dump(data, outfile, indent = 4, sort_keys = True, ensure_ascii=False)
        outfile.close()

    print('Done')
    print('Wordbreaks applied to ' + output_filename)
    sys.stdout.flush()
