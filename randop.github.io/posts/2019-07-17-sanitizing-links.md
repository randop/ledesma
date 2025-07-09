---
layout: post
title:  "Sanitizing Links"
date: 2019-07-17T10:00:00+08:00
categories: php cybersecurity
---
Script to sanitize links on string. This can be useful when trying to format links from untrusted sources.

#### Requirements:
+ composer
+ php-xml
+ php-mbstring
+ ezyang/htmlpurifier

#### Installation:
```
composer require ezyang/htmlpurifier
```

#### Codes:
```php
<?php
function fix_special_links($text='') {
    $fixed = $text;
    $fixed = str_replace("/><br />", "/> <br>", $fixed);
    $fixed = str_replace("/><br>", "/> <br>", $fixed);
    $fixed = preg_replace("#\<http:\/\/(.*)(\/\>)+#i", "(http://$1)", $fixed);
    $fixed = preg_replace("#\<https:\/\/(.*)(\/\>)+#i", "(https://$1)", $fixed);
    return $fixed;
}
function sanitize_links($text='') {
    $text = $this->fix_special_links($text);
    $config = \HTMLPurifier_Config::createDefault();
    $purifier = new \HTMLPurifier($config);
    $text = $purifier->purify($text);
    $return = $text;
    try {
        libxml_use_internal_errors(true);
        libxml_clear_errors();
        $doc = new DOMDocument('1.0', 'UTF-8');
        $doc->preserveWhiteSpace = false;
        $doc->loadHTML( mb_convert_encoding($text, 'HTML-ENTITIES', 'UTF-8'));
        $links = $doc->getElementsByTagName('a');
        //Loop through each <a> tags and replace them by their text content
        for ($i = $links->length - 1; $i >= 0; $i--) {
            $linkNode = $links->item($i);
            $lnkText = $linkNode->textContent;
            $newTxtNode = $doc->createTextNode($lnkText);
            $linkNode->parentNode->replaceChild($newTxtNode, $linkNode);
        }
        $return = $doc->saveHTML($doc->documentElement);
        $return = str_replace( array('<html>', '</html>', '<body>', '</body>'), array('', '', '', ''), $return);
    } catch (Exception $e) {
        //fallback on using preg_replace
        $return = preg_replace('#<a.*?>([^>]*)</a>#i', '$1', $text);
    }
    $return = str_replace(">\n<", "><", $return);
    $return = str_replace(">\r<", "><", $return);
    return $return;
}
function sanitize_string($string='') {
    $string = iconv("Windows-1251", "UTF-8", $string);
    $string = preg_replace('/[\x{2019}\x{2018}\x{2019}\x{201A}\x{201B}\x{2032}\x{2035}]/u', "'", $string);
    $string = preg_replace('/[\x{201C}\x{201D}\x{201E}\x{201F}\x{2033}\x{2036}]/u', '"', $string);
    $string = preg_replace('/[[:^print:]]/', "", $string);
    return $string;
}
```

#### Usage:
```php
$string = "String with links <a href='https://randolphledesma.com'>https://randolphledesma.com</a>";
echo sanitize_links($string);
```