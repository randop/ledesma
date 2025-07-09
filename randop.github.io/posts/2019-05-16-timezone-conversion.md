---
layout: post
title:  "Timezone Conversion"
date: 2019-05-16T10:00:00+08:00
categories: php timezone
---
Converting a timestamp from and to a different timezones.

```
<?php
$timestamp='2019-05-16 07:56:00';
$format="Y-m-d H:i:s";
$from_timezone='Asia/Manila';
$to_timezone='America/Chicago';
$source_timezone = new DateTimeZone($from_timezone);
$destination_timezone = new DateTimeZone($to_timezone);
$datetime = new DateTime($timestamp, $source_timezone);
$offset = $destination_timezone->getOffset($datetime);
$newdate = date($format, $datetime->format('U') + $offset);
echo $newdate;
```