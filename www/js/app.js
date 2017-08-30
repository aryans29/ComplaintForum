/**
 * List of Global variables that can be used through out the application multiple times
*/
  var issueId=[];
  var brand_names=[];
  var product_names=[];
  var product_type=[];
  var time=[];
  var description;
  var lat1;
  var lng1;
  var userType_G;


///// Called when app launch

function gpsSuccess(position){
    lat1=position.coords.latitude;
    lng1=position.coords.longitude; 
    sessionStorage.setItem("LATITUDE",lat1);
    sessionStorage.setItem("LONGITUDE",lng1);
    //openMap();
 }
 function gpsError(error){ 
	alert('//do nothing');
}


function startGPS(){ 
    options = { enableHighAccuracy: true };
		navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError,options);
        
}

function getUUID() {
    localStorage.setItem("deviceId",device.uuid);
}

function onBackKeyDown() {
    var href = $(location).attr("href");
    if(href.toString().indexOf("index.html#")<0)
    {
       exitBtn();
    }
}
function exitBtn()
{
    navigator.app.exitApp();
}

$(function() {
  $("#LoginBtn").click(onLoginBtn);
  $("#RegisterBtn").click(onRegisterBtn);
  $("#SaveBtn").click(onSaveBtn);
  $("#EditBtn").click(onEditBtn);
  $("#UpdateBtn").click(onUpdateBtn);
  $("#YesBtn_logout").click(onLogoutBtn);
  $("#YesBtn_delete").click(deleteMemo);
  $("#OkEditBtn").click(OkBtn);
  document.addEventListener("backbutton", onBackKeyDown, false);  
  /*cordova.plugins.backgroundMode.setDefaults({ text:'Doing heavy tasks.'});
    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () {
        setTimeout(function () {
            // Modify the currently displayed notification
            cordova.plugins.backgroundMode.configure({
                text:'Running in background for more than 5s now.'
            });
        }, 5000);
    }*/
});

function getDashDetailsFromLocalFile()
{
userId = 'testUser1';
 xmlObj = $.parseXML(fuDashXML);
 $xml = $(xmlObj);
 $(location).attr("href","#f_DashBoardPage");
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
}

function clearLocalStorage()
{
    localStorage.clear();
}

function OkBtn()
{
    $('#editSuccess').hide();
}

function rowClick(i)
{
    console.log("userType_G="+userType_G);
    $(location).attr("href","#ShowPage");
    if(userType_G == "endUser")
        setContent(i);
    if(userType_G == "fEngineer")
        setComplaintContent(i);
} 

function setContent(i)
{
     // = localStorage.getItem('dashBoardXML');
     //$xml = $.parseXML(xmlObj);
     xmlNode = $($xml);
     xmlNode.find('IssueDetail[issueId="'+i+'"]').each(function()
       {
          $issueId = $(this).attr('issueId');
          $product_name = $(this).find('product_name').text();
          $brand_name = $(this).find('brand_name').text();
          $description = $(this).find('description').text();
          $product_type = $(this).find('product_type').text();
          onShowLink($brand_name,$product_type,$description,$issueId,$product_name);
       });
}
function createDashBoard(brand_names,product_names,product_type,issueId,time,status)
{
    var image_name;
    var HTML = "<table id=\"compliantDashBoard\" class=\"comp_dshbrd\" border=\"0\" width=100%>";
    HTML+="<tr class=header><td align=center>Sno</td><td align=center>Description</td><td align=center>Time</td><td align=center>Status</td></tr>";
        for(j=0;j<brand_names.length;j++)
        {
            image_name=(status[j]=='Done')?'bdone.png':'pend.png';
            
            HTML += "<tr id=\'"+issueId[j]+"\' onclick=\"javascript:rowClick("+issueId[j]+");\"class=\"table_row\">"+
                    "<td align=center>"+(j+1)+"</td>"+
                    "<td align=center>"+product_names[j]+"</td>"+
                    "<td align=center>"+time[j]+"</td>"+
                    "<td align=center><img width='40px' height='40px' src='images/"+image_name+"'/></td>"+
                    "</tr>";
        }
        HTML += "</table>";
        document.getElementById("tablecontainer").innerHTML = HTML;
}

var currentMemoID;
var MC = monaca.cloud;

var UserId;

function onRegisterBtn()
{
  var email = $("#reg_email").val();
  var password = $("#reg_password").val();
console.log(MC);
  MC.User.register(email, password)
    .done(function()
    {
      console.log('Registration is success!' + MC.User._oid);
      $.mobile.changePage('#ListPage');
    })
    .fail(function(err)
    {
        console.log('FAILED');
      alert('Registration failed!');
      console.error(JSON.stringify(err));
    });
}

function onLoginBtn()
{
  var userId = $("#login_email").val();
  UserId = userId; 
  var password = $("#login_password").val();
  var userHash=$.base64.encode(userId+":"+password);   
  console.log(userHash);
  console.log('http://ascensive.ddns.net/AllianceCare/login.action?userHash='+userHash);
  $.ajax({
   type: "POST",
    url: "http://ascensive.ddns.net/AllianceCare/login.action",
    data: "userHash="+userHash,
    success: function(html){    
        $xml = $( html );
        $title = $xml.find( "access" );
        $userType = $xml.find( "userType" );
        userType_G = $userType.text();
       if($title.text()=='active')    
        {  
            if($userType.text()=='endUser')
            {
                localStorage.setItem("address",($xml.find( "address" )).text());
                getLatLongOfLocation(localStorage.getItem("address"));
                $(location).attr("href","#ListPage");
                getDashBoardList(userId,'pending');
            }
            if($userType.text()=='fEngineer')
            {
                getLocationAndUpdate();
                $(location).attr("href","#f_DashBoardPage");
                getDashBoardDetails(userId);
            }
       }
    else if($title.text()=='inactive')
    {
     alert('Inactive User ! Please Contact your Administrator.');
    }
    else
    {
        alert('Invalid Login Details !');
    }
   },
   beforeSend:function()
   {
    $("#add_err").css('display', 'inline', 'important');
    $("#add_err").html("<img src='images/ajax-loader.gif' /> Loading...")
   }
  });
}

function onLogoutBtn()
{
  MC.User.logout()
    .done(function()
    {
      console.log('Logout is success!');
      $.mobile.changePage('#LoginPage');
    })
    .fail(function(err)
    {
      alert('Logout failed!');
      console.error(JSON.stringify(err));
    });
}

function onSaveBtn()
{
  var brand = $("select[name=add_brand]").val();
  var productType = $("select[name=add_productType]").val();
  var model_name = $("#add_model_name").val();
  var description = $("#add_content").val();
  if (brand != '')
  {
    addQuery(brand,productType,model_name,description);
  }
}

function addQuery(brand,productType,model_name,description) 
{
    var detailsHash= $.base64.encode(brand+":"+productType+":"+model_name+":"+description+":"
                                    +UserId+":"+localStorage.getItem('customer_lattitude')+":"+localStorage.getItem('customer_longtitude'));    
    console.log('detailsHash=='+detailsHash);
    $.ajax({
   type: "POST",
   url: "http://ascensive.ddns.net/AllianceCare/dashBoard.action",
    data: "detailsHash="+detailsHash+"&requestFor=addQuery",
   success: function(html){
       //alert('success=='+html);
       $(location).attr("href","#ListPage");
       getDashBoardList(UserId,'pending');
   },
   beforeSend:function()
   {
       //alert('beforSend');
   }
  });
    
}

function onShowLink(title,content,description,issueId,model_name)
{
    if(userType_G == "fEngineer")
        $("#EditBtn").attr("style","display:none;");
        
  $("select[name=show_brand]").val(title);
  $("select[name=show_productType").val(content);
  $("#show_description").text(description);
  $("#issueId").text(issueId);
  $("#show_model_name").val(model_name); 
}

function onDeleteBtn(id)
{
  currentMemoID = id;
  $( "#yesNoDialog_delete" ).popup("open", {positionTo: "origin"});
}

function deleteMemo()
{
  console.log('yes');
  var memo = MC.Collection("Memo");
  memo.findOne(MC.Criteria("_id==?", [currentMemoID]))
    .done(function(item)
    {
      console.log(JSON.stringify(item));
      item.delete()
      .done(function()
       {
          console.log("The memo is deleted!");
          getMemoList();
          $.mobile.changePage("#ListPage");
       })
       .fail(function(err){
           console.log("Fail to delete the item.");
       });
      
    })
    .fail(function(err){
      console.error(JSON.stringify(err));
      alert('Insert failed!');
    });
}

function onEditBtn()
{
  $(location).attr("href","#EditPage");
  $("select[name=edit_brand]").val($("select[name=show_brand]").val());
  $("select[name=edit_productType]").val($("select[name=show_productType]").val());
  $("#edit_description").text($("#show_description").text());
  $("#edit_issueId").text($("#issueId").text());
  $("#edit_model_name").val($("#show_model_name").val());
}

function onUpdateBtn()
{ 
    var issueId = $("#edit_issueId").text();
    var brand   = $("select[name=edit_brand]").val();
    var productType = $("select[name=edit_productType]").val();
    var model_name = $("#edit_model_name").val();
    var description = $("#edit_description").val();
    //alert(description);alert($("#edit_description").text());
    var updateHash = $.base64.encode(issueId+":"+brand+":"+productType+":"+model_name+":"+description+":"+UserId);    
    console.log('updateHash= '+updateHash);
    $.ajax({
   type: "POST",
   url: "http://ascensive.ddns.net/AllianceCare/dashBoard.action",
    data: "dashboardHash="+updateHash+"&requestFor=updateQuery",
   success: function(html){
        $(location).attr("href","#ListPage");
         getDashBoardList(UserId,'pending');
    }
  });
    
   
}

function editMemo(id, new_title, new_content){
  var memo = MC.Collection("Memo");
  memo.findMine(MC.Criteria("_id==?", [id]))
    .done(function(items, totalItems)
    {
      items.items[0].title = new_title;
      items.items[0].content = new_content;
      items.items[0].update()
        .done(function(updatedItem)
        {
          console.log('Updating is success!');
          //display a dialog stating that the updating is success
          $( "#okDialog_edit" ).popup("open", {positionTo: "origin"}).click(function(event)
          {
            getMemoList();
            $.mobile.changePage("#ListPage");
          });
        })
        .fail(function(err){ console.error(JSON.stringify(err)); });
    })
    .fail(function(err){
      console.error(JSON.stringify(err));
    });
}

function getMemoList() {
  console.log('Refresh List');
  var MC = monaca.cloud;
  var memo = MC.Collection("Memo");
  memo.findMine()
    .done(function(items, totalItems)
    {
        console.log("all: " + JSON.stringify(items));
      $("#ListPage #TopListView").empty();
      var list = items.items;

      for (var i in list)
      {
        var memo = list[i];
        var d = new Date(memo._createdAt);
        var date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
        $li = $("<li><a href='javascript:onShowLink(\"" + memo._id + "\",\"" + memo.title + "\",\"" + memo.content + "\")' class='show'><h3></h3><p></p></a><a href='javascript:onDeleteBtn(\"" + memo._id + "\")' class='delete'>Delete</a></li>");
        $li.find("h3").text(date);
        $li.find("p").text(memo.title);
        $("#TopListView").prepend($li);
      }
      if (list.length == 0) {
        $li = $("<li>No memo found</li>");
        $("#TopListView").prepend($li);
      }
      $("#ListPage #TopListView").listview("refresh");
    })
  .fail(function(err){
    if (err.code == -32602) {
      alert("Collection 'Memo' not found! Please create collection from IDE.");
    } else {
      console.error(JSON.stringify(err));
      alert('Insert failed!');
    }
  });
}

function getDashBoardList(userId,statu)
{
  var status=[];
  var userHash=$.base64.encode(userId+":"+statu);    
  console.log('oooo='+userHash);
  $.ajax({
   type: "POST",
   url: "http://ascensive.ddns.net/AllianceCare/dashBoard.action",
    data: "dashboardHash="+userHash+"&requestFor=dashBoardList",
   success: function(html){    
       alert('getDashBoardList='+html);
       console.log('===getDashBoardList='+html);
         localStorage.setItem('dashBoardXML',html);
         $xml = $( html ),
         $($xml).find("IssueDetail").each(function()
        {
        
         brand_names.push($(this).find('brand_name').text());   
         product_names.push($(this).find('product_name').text());
         issueId.push($(this).attr('issueId'));
         product_type.push($(this).find('product_type').text());
         time.push($(this).find('time').text());
         status.push($(this).find('status').text());
         
         }),
         createDashBoard(brand_names,product_names,product_type,issueId,time,status);
    }
  });

}

function calculateDistance1(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

  function initialize() {
  alert('3');
  
          codeLatLng(lat1,lng1);
  }
  
  function testDist(customerAddress)
  { 
     // customerAddress='HCL Technology Hub, Plot No 3A ,Sector 126, Noida, Uttar Pradesh 201303';
      //customerAddress='Alliance Digitech Private Limited, LGF, M-15, Mamura, Sector 66, Noida, Uttar Pradesh 201307';
  
      //alert('testDist=='+customerAddress);
      var geocoder = new google.maps.Geocoder();
       geocoder.geocode( { 'address':customerAddress}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
              //alert("location : "+customerAddress +' or '+ results[0].geometry.location.lat() + "," +results[0].geometry.location.lng()); 
            //alert("location :"+localStorage.getItem('formatAdd')+": " + results[0].geometry.location.lat() + "," +results[0].geometry.location.lng()); 
        	//codeLatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
          //  codeLatLng(lat1, lng1);
			//alert('calling caluate');
			//alert('dis=='+calculateDistance(results[0].geometry.location.lat(),results[0].geometry.location.lng(),lat1,lng1));
			//alert('new=='+distance(results[0].geometry.location.lat(),results[0].geometry.location.lng(),lat1,lng1,'K'));
            var distance = calculateDistance(results[0].geometry.location.lat(),results[0].geometry.location.lng(),lat1,lng1);
            openMap(results[0].geometry.location.lat(),results[0].geometry.location.lng(),customerAddress,distance);
          } else {
            console.log("Something got wrong " + status);
            breakAddress(customerAddress);
            
          }
        });
 }
 function breakAddress(address)
 {
  ///   alert('breakAddress=='+address);
     var address1 = address.split(",");
     testDist(address1.splice(1).toString());
 }
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.asin(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
  
}

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

  function codeLatLng(lat, lng) {
var geocoder= new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      console.log(results);
        if (results[1]) {
         //formatted address
         localStorage.setItem('formatAdd',results[0].formatted_address);
         alert(results[0].formatted_address);
        //find country name
             for (var i=0; i<results[0].address_components.length; i++) {
            for (var b=0;b<results[0].address_components[i].types.length;b++) {

            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                    //this is the object you are looking for
                    city= results[0].address_components[i];
                    break;
                }
            }
        }
        //city data
        alert(city.short_name + " " + city.long_name)


        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }
  
  function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}


function upDateLocation()
{
    var locationHash=$.base64.encode(UserId+":"+sessionStorage.getItem("LATITUDE")+":"+sessionStorage.getItem("LONGITUDE")+":"+localStorage.getItem("deviceId"));
    console.log('locationHash='+locationHash);
    $.ajax({
   type: "POST",
   url: "http://ascensive.ddns.net/AllianceCare/alliance.action",
    data: "locationHash="+locationHash+"&requestFor=location",
   success: function(html){    
         //alert(html);  
    } 
  });
}

function getLocationAndUpdate()
{
                startGPS();
                setTimeout(getUUID,1000);
                upDateLocation();
                console.log('date==='+new Date()+'---:---'+'latt==='+sessionStorage.getItem("LATITUDE"));
               setTimeout(getLocationAndUpdate, 5000);
}

function getLatLongOfLocation(customer_address)
{
    alert('---'+customer_address);
    console.log('---'+customer_address);
    var geocoder =  new google.maps.Geocoder();
    geocoder.geocode( { 'address': customer_address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) 
          {
            localStorage.setItem('customer_lattitude', results[0].geometry.location.lat());
            localStorage.setItem('customer_longtitude',results[0].geometry.location.lng());
            console.log("location of customer : getLatLongOfLocation :"+customer_address+": " + results[0].geometry.location.lat() + "," +results[0].geometry.location.lng()); 
            alert("location of customer : getLatLongOfLocation :"+customer_address+": " + results[0].geometry.location.lat() + "," +results[0].geometry.location.lng()); 
    	  } else {
            alert("Something got wrong " + status);
          }
        });
}