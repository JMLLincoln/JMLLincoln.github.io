<?php
function connect() {
    $db = @new mysqli('newswire.theunderminejournal.com', '', '', 'newsstand');
    if ($db->connect_error) {
        echo "Connect error: {$db->connect_error}\n";
        return null;
    }
    $db->set_charset("utf8");
    return $db;
}

function createQuery() {
    $query = <<<'EOF'
    select i.id, s.price
    from tblItemSummary s
    join tblDBCItem i on i.id = s.item
    join tblRealm r on s.house = r.house
    where r.region = ?
    and r.slug = ?
    and i.name_enus = ?
EOF;

    return $query;
}

function sendQuery($db, $query, $itemName) {
    $region = 'EU';
    $slug = 'ravencrest';
    $itemId = $price = null;

    $stmt = $db->prepare($query);
    $stmt->bind_param('sss', $region, $slug, $itemName);
    $stmt->execute();
    $stmt->bind_result($itemId, $price);

    $stmt->fetch();
    $stmt->close();

    $g = substr($price, 0, strlen($price)-4);
    $s = substr($price, strlen($price)-4, 2);
    $c = substr($price, strlen($price)-2, 2);
    
    return array($itemId, $g, $s, $c);
}

header('Content-type: text/plain');
echo "\n";

$db = connect();
if ($db != null) {
  $query = createQuery();
  echo "Searching for:\n";
  echo $_POST["data"];
  echo "\n\n";
  
  $remove_character = array("\r\n", "\n", "\r");
  $data = str_replace($remove_character , ";", $_POST["data"]);
  
  foreach(explode(";", $data) as $itemName) {
    
    $r = sendQuery($db, $query, $itemName);
    echo sprintf("[%s] (id %d) %dg %ds %dc\n", $itemName, $r[0], $r[1], $r[2], $r[3]);
  }

  $db->close();
}






