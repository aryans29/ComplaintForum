
function getDashBoardDetails(userId)
{
  var feHash=$.base64.encode(userId);   
  console.log('http://ascensive.ddns.net/AllianceCare/dashBoard.action?fEngHash='+feHash);
  $.ajax({
   type: "POST",
   url: "http://ascensive.ddns.net/AllianceCare/dashBoard.action",
    data: "fEngHash="+feHash+"&requestFor=fieldEngineerDashboard",
    success: function(html){    
        
        console.log('fuDash=='+ html);
        localStorage.setItem("fuDashBoard",html);
        $xml = $( html );
        var issueId ='';
        $xml.find("issueDetails").each(function()
            {
                issueId = $(this).attr('issueId');
            });
        $("#complaint_count").text($xml.find("count").text());
        $("#complaint_count").attr("href","javascript:showDashBoard('"+userId+"')");
        $("#customerName").text($xml.find("name").text());
        $("#telephone").text($xml.find("mobilenumber").text());
        $("#telephone").attr("href","tel:"+$xml.find("mobilenumber").text());
        $("#address").text(formatAddress);
        testDist(formatAddress());
        $("#openIssueDetails").attr("href","javascript:viewComplaint('"+issueId+"')");
    },
   beforeSend:function()
   {
    $("#add_err").css('display', 'inline', 'important');
    $("#add_err").html("<img src='images/ajax-loader.gif' /> Loading...");
   }
  });
}

function formatAddress()
{
   return $xml.find("house_no").text()+", Street/Lane No-"+$xml.find("street_lane_no").text()+", "+ $xml.find("area_locality").text()+", "+
    $xml.find("city").text()+", "+$xml.find("state").text()+", "+$xml.find("pincode").text()+", "+
    $xml.find("country").text();
}

function openMap(lat1,lng1,label,distance)
 {
  $("#distInKm").attr("href",'geo:0,0?q=' + lat1+','+lng1 + '(' + label + ')'+','+'_system');
  $("#distInKm").text(distance.toString().substr(0,4)+" KM");         // we can also use "parseFloat(Math.round(num1 * 100) / 100).toFixed(2);"
}

function viewComplaint(issueid)
{
    $(location).attr("href","#ShowPage");
    setComplaintContent(issueid);
}

function setComplaintContent(id)
{
     xmlNode = $($xml);
     xmlNode.find('issueDetails[issueId="'+id+'"]').each(function()
       {
          $issueId = $(this).attr('issueId');
          $product_name = $(this).find('product_name').text();
          $brand_name = $(this).find('brand_name').text();
          $description = $(this).find('description').text();
          $product_type = $(this).find('product_type').text();
          onShowLink($brand_name,$product_type,$description,$issueId,$product_name);
       });
}

function showDashBoard(userId)
{
    $(location).attr("href","#ListPage");
    $("#Addbtn").attr("style","display:none;");
    var status=[];
    var issueId=[];
      xmlNode = $($xml);
      xmlNode.find("IssueDetail").each(function()
        {
         brand_names.push($(this).find('brand_name').text());   
         product_names.push($(this).find('product_name').text());
         issueId.push($(this).attr('issueId'));
         product_type.push($(this).find('product_type').text());
         time.push($(this).find('time').text());
         status.push($(this).find('status').text());
         createDashBoard(brand_names,product_names,product_type,issueId,time,status);
         });
         
}