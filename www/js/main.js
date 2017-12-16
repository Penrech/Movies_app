var theList = $("#ListHandler");
var MainURL="https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=fa2afcac91dd354e57555c8d08d690ad";
var DetailURL="";
var GenreArray= [];
var deviceWidth = window.innerWidth;
console.log(deviceWidth);
var PosterImageSize = Math.ceil(deviceWidth/2.22);
console.log(PosterImageSize);

function init(){
   
    createDB();
    getGenreArray();
    getMoviesListAndDrawList();
    $('#ListButton').click(function(){
       getMoviesListAndDrawList();
    });
     //$('#ListButton').attr("class","ui-link ui-btn");
    $('#FavButton').click(function(){
       selectDB();
    });

    
}



function createDB(){
    
     db = window.sqlitePlugin.openDatabase({name: 'favorites.db', location: 'default'});
    
     db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY,original_title, vote_average,release_date,genres,overview,poster_path,backdrop_path)',
     ], function() {
    console.log('Created database OK');
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });  
    
}

function selectDB(){ 

     db.executeSql('SELECT * FROM favorites', [], function(rs) {
         //console.log("numero de filas "+rs.rows.length);
      if (rs.rows.length == 0){
          theList.empty();
            theList.append(
                    '<li class="ui-block-solo"  style="margin-top:5%;border: none;text-align:center; font-size:16px;">'+
                        '<h3>There is not favorites yet</h3>'+
                    '<li>'
                );
          theList.listview("refresh");
      }  
    else{
        theList.empty();
        for(i=0;i<rs.rows.length;i++){
        theList.append(
                                                 '<li class="ui-body-a"  style="border: none">'+
                                                    '<ul data-role="listview" class="ui-grid-a" style="background-color: #e8e8e8;">'+
                                                    '<li class="ui-block-a">'+
                                                    '<img src="http://image.tmdb.org/t/p/w185'+rs.rows.item(i).poster_path+'" style="width:'+PosterImageSize+'px">'+
                                                    '</li>'+
                                                    '<li class="ui-block-b" >'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-a" style="width:80%;"><h3>'+rs.rows.item(i).original_title+'</h3></li>'+
                                                            '<li class="ui-block-b" style="width:20%;"><h3>'+rs.rows.item(i).vote_average+' <i class="fa fa-star"  aria-hidden="true"></i></h3></li>'+
                                                        '</ul>'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-a" style="width:25%;"><h3  style="font-weight:lighter;"><i class="fa fa-calendar" aria-hidden="true"></i> '+(rs.rows.item(i).release_date).substr(0,4)+'</h3></li>'+
                                                            '<li class="ui-block-b" style="width:75%;"><h3  style="font-weight:lighter; margin-left:2%;">'+rs.rows.item(i).genres+'</h3></li>'+
                                                        '</ul>'+
                                                        '<div><p class="description_list" >'+rs.rows.item(i).overview+'</p></div>'+
                                                        '<div onclick="javascript:isFavorite('+rs.rows.item(i).id+',\'DbDetail\')" ><i class="fa fa-plus" aria-hidden="true" style="text-align:center;margin-left:45%;margin-top:25%;margin-bottom:25%;font-size:20px;font-weight:bold;"></i></div>'+
                                                    '</li>'+
                                                '</ul>'+
                                                '</li>');
        }
        theList.listview("refresh");
    }   
  }, function(error) {
    console.log('SELECT SQL statement ERROR: ' + error.message);
  });

} 

function detailDB(id,isfav){
     db.executeSql('SELECT * FROM favorites WHERE id=?', [id], function(res) {
            theList.empty();
            var backGroundImage = "http://image.tmdb.org/t/p/w780"+res.rows.item(0).backdrop_path;
            var GenreString="";
            var starType="";
            var starColor="";
            var starLink="";
             if(isfav == 1){
                 console.log("Entro aqui, ya que es favorita");
                starType="fa fa-star";
                starColor="color:yellow;";
                starLink="onclick='deleteFromFavorite("+res.rows.item(0).id+")'";             
            }
            else if(isfav == 0){
                console.log("Entro aqui, ya que NO es favorita");
                starType="fa fa-star-o";
                starColor="color:black;";
                starLink='onclick=\'addToFavorite("'+res.rows.item(0).id+'","'+res.rows.item(0).original_title+'","'+res.rows.item(0).vote_average+'","'+res.rows.item(0).release_date+'","'+res.rows.item(0).genres+'","'+res.rows.item(0).overview+'","'+res.rows.item(0).poster_path+'","'+res.rows.item(0).backdrop_path+'")\'';     
            }
            theList.append(
                                                 '<li class="ui-body-a"  style="border: none">'+
                                                    '<ul data-role="listview" class="ui-grid-a" style="background-color: #e8e8e8;">'+
                                                    '<li class="ui-block-solo" id="backImageHolder" style="background-image: url('+backGroundImage+');background-size:cover;background-position-x:50%;background-color:#afafaf;background-blend-mode: overlay;">'+
                                                    '<img src="http://image.tmdb.org/t/p/w185'+res.rows.item(0).poster_path+'" style="width:'+PosterImageSize+'px; margin-left:25%;">'+
                                                    '</li>'+
                                                    '<li class="ui-block-solo" style="padding: 0% 5% 0% 5%;">'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-solo" style="text-align:center; font-size:14px;"><h3>'+res.rows.item(0).original_title+'</h3></li>'+
                                                        '</ul>'+
                                                        '<ul data-role="listview" class="ui-grid-a" style="margin-left:12.5%;">'+
                                                            '<li class="ui-block-a" style="width:70%;"><h3  style="font-weight:lighter;"><i class="fa fa-calendar" aria-hidden="true"></i> Release Date: '+res.rows.item(0).release_date+'</h3></li>'+
                                                            '<li class="ui-block-b" style="width:30%;"><h3>'+res.rows.item(0).vote_average+' <i class="fa fa-star"  aria-hidden="true"></i></h3></li>'+
                                                        '</ul>'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-solo"><h3  style="font-weight:lighter;">'+res.rows.item(0).genres+'</h3></li>'+
                                                        '</ul>'+
                                                        '<div><p class="description_listDetails" >'+res.rows.item(0).overview+'</p></div>'+
                                                        '<div><i id="favStar" '+starLink+' class="'+starType+'" aria-hidden="true" style="'+starColor+'text-align:center;margin-left:46%;margin-top:12.5%;margin-bottom:12.5%;font-size:20px;font-weight:bold;"></i></div>'+
                                                    '</li>'+
                                                '</ul>'+
                                                '</li>');
            theList.listview("refresh");
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
}

function deleteFromFavorite(id){
    db.executeSql('SELECT * FROM favorites WHERE id=?', [id], function(res) {
        var title = res.rows.item(0).original_title;
        var vote = res.rows.item(0).vote_average;
        var date = res.rows.item(0).release_date;
        var genres= res.rows.item(0).genres;
        var overview = res.rows.item(0).overview;
        var poster = res.rows.item(0).poster_path;
        var backdrop = res.rows.item(0).backdrop_path;
        
                db.executeSql('DELETE FROM favorites WHERE id=?', [id], function(rs) {
                console.log("Se borrara la id "+id);
                console.log('rowsDeleted: ' + rs.rowsAffected);
                $('#favStar').attr("class","fa fa-star-o");
                $('#favStar').css("color","black");
                console.log(title+"Borrando de favoritos , extra ");
                $('#favStar').attr("onclick",'addToFavorite('+id+',"'+title+'","'+vote+'","'+date+'","'+genres+'","'+overview+'","'+poster+'","'+backdrop+'")');

              }, function(error) {
                console.log('Delete SQL statement ERROR: ' + error.message);
              });
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
}

function addToFavorite(id,title,vote,date,genres,overview,poster,backdrop){
    
    db.executeSql('INSERT INTO favorites VALUES (?,?,?,?,?,?,?,?)', [id,title,vote,date,genres,overview,poster,backdrop], function(rs) {
        $('#favStar').attr("class","fa fa-star");
        $('#favStar').css("color","yellow");
        //console.log("lo que se envia como parametro a deletefromfavorite es "+id);
        $('#favStar').attr("onclick","deleteFromFavorite("+id+")");   
  }, function(error) {
    console.log('SELECT SQL statement ERROR: ' + error.message);
  }); 
}

function isFavorite(id,destination){
        // The .gif files doens't seem to work with android, so I search for a css based loading image.
        theList.empty();
            theList.append( '<li class="kart-loader" style="border:none;margin-top: 50%;margin-left:28%;padding:20%;"><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div></li>'
                );
            theList.listview("refresh");
        
        db.executeSql('SELECT count(*) AS mycount FROM favorites WHERE id=?', [id], function(res) {
        var counter = res.rows.item(0).mycount;
        if (destination == "webDetail"){
            if (counter == 0){ 
                getMovieAndDrawDetail(id,false);}
            else{ 
               getMovieAndDrawDetail(id,true);}
        }
        else {
            if (counter == 0){ 
                detailDB(id,false);}
            else{ 
               detailDB(id,true);}
        }
       
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });  
}

function getGenreArray(){
    
     var request = $.ajax({
          url: "https://api.themoviedb.org/3/genre/movie/list?api_key=80865681c4ccae7b47ffebc8b71952d8&language=en-US",
          method: "GET"
        });
        request.done(function( result ) {
            //return result;
            GenreArray = result.genres;
            
          //alert(result.original_title);
        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
    
}

 
function getMovieAndDrawDetail(id,isfav){
    
        
     var request = $.ajax({
          url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=80865681c4ccae7b47ffebc8b71952d8",
          method: "GET",
        });
    
       
        request.done(function( result ) {
            //return result;
            theList.empty();
            var backGroundImage = "http://image.tmdb.org/t/p/w780"+result.backdrop_path;
            var GenreString="";
            var starType="";
            var starColor="";
            var starLink="";
            for(ig=0;ig<result.genres.length;ig++){
                if((result.genres.length - ig) == 1){
                    GenreString += result.genres[ig].name;
                }
                else{
                GenreString += result.genres[ig].name + ",";
                }
                }
            
            // I do this step because there quoting marks in some of the descriptions of the movies, and that breaks the code.
                var TitleStringWithQuoteMarks = result.original_title;
                var correctTitleString = TitleStringWithQuoteMarks.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                var OverviewStringWithQuoteMarks = result.overview;
                var correctOverviewString = OverviewStringWithQuoteMarks.replace(/'/g, "&apos;").replace(/"/g, "&quot;");


              if(isfav == 1){
                    //console.log(result.original_title+" is favorite");
                    starType="fa fa-star";
                    starColor="color:yellow;";
                    starLink="onclick='deleteFromFavorite("+result.id+")'";

                }
                else if(isfav == 0){
                    //console.log(result.original_title+" is not favorite");
                    starType="fa fa-star-o";
                    starColor="color:black;";


                  starLink='onclick=\'addToFavorite("'+result.id+'","'+correctTitleString+'","'+result.vote_average+'","'+result.release_date+'","'+GenreString+'","'+correctOverviewString+'","'+result.poster_path+'","'+result.backdrop_path+'")\'';

                }
                theList.append(
                                     '<li class="ui-body-a"  style="border: none">'+
                                        '<ul data-role="listview" class="ui-grid-a" style="background-color: #e8e8e8;">'+
                                        '<li class="ui-block-solo" id="backImageHolder" style="background-image: url('+backGroundImage+');background-size:cover;background-position-x:50%;background-color:#afafaf;background-blend-mode: overlay;">'+
                                        '<img src="http://image.tmdb.org/t/p/w185'+result.poster_path+'" style="width:'+PosterImageSize+'px; margin-left:25%;">'+
                                        '</li>'+
                                        '<li class="ui-block-solo" style="padding: 0% 5% 0% 5%;">'+
                                            '<ul data-role="listview" class="ui-grid-a">'+
                                                '<li class="ui-block-solo" style="text-align:center; font-size:14px;"><h3>'+result.original_title+'</h3></li>'+
                                            '</ul>'+
                                            '<ul data-role="listview" class="ui-grid-a" style="margin-left:12.5%;">'+
                                                '<li class="ui-block-a" style="width:70%;"><h3  style="font-weight:lighter;"><i class="fa fa-calendar" aria-hidden="true"></i> Release Date: '+result.release_date+'</h3></li>'+
                                                '<li class="ui-block-b" style="width:30%;"><h3>'+result.vote_average+' <i class="fa fa-star"  aria-hidden="true"></i></h3></li>'+
                                            '</ul>'+
                                            '<ul data-role="listview" class="ui-grid-a">'+
                                                '<li class="ui-block-solo"><h3  style="font-weight:lighter;">'+GenreString+'</h3></li>'+
                                            '</ul>'+
                                            '<div><p class="description_listDetails" >'+result.overview+'</p></div>'+
                                            '<div><i id="favStar" '+starLink+' class="'+starType+'" aria-hidden="true" style="'+starColor+'text-align:center;margin-left:46%;margin-top:12.5%;margin-bottom:12.5%;font-size:20px;font-weight:bold;"></i></div>'+
                                        '</li>'+
                                    '</ul>'+
                                    '</li>');

                theList.listview("refresh");


           
        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}



function getMoviesListAndDrawList(){
 theList.empty();
            theList.append( '<li class="kart-loader" style="border:none;margin-top: 50%;margin-left:28%;padding:20%;"><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div></li>'
                );
            theList.listview("refresh");
    
     var request = $.ajax({
          url: MainURL,
          method: "GET"
         
        });

        request.done(function( moviesList ) {

            
            theList.empty();
            for (i=0;i<moviesList.results.length;i++){
                var GenreResult = moviesList.results[i].genre_ids;
                var GenreString="";

                for(ig=0;ig<GenreResult.length;ig++){

                    var Provisionalresult = $.grep(GenreArray, function(e){ return e.id == GenreResult[ig];});
                    if((GenreResult.length- ig) == 1){
                        GenreString += Provisionalresult[0].name;
                    }
                    else{
                    GenreString += Provisionalresult[0].name + ",";
                    }
                }

                 
                 theList.append(
                                                 '<li class="ui-body-a"  style="border: none">'+
                                                    '<ul data-role="listview" class="ui-grid-a" style="background-color: #e8e8e8;">'+
                                                    '<li class="ui-block-a">'+
                                                    '<img src="http://image.tmdb.org/t/p/w185'+moviesList.results[i].poster_path+'" style="width:'+PosterImageSize+'px">'+
                                                    '</li>'+
                                                    '<li class="ui-block-b" >'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-a" style="width:80%;"><h3>'+moviesList.results[i].original_title+'</h3></li>'+
                                                            '<li class="ui-block-b" style="width:20%;"><h3>'+moviesList.results[i].vote_average+' <i class="fa fa-star"  aria-hidden="true"></i></h3></li>'+
                                                        '</ul>'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-a" style="width:25%;"><h3  style="font-weight:lighter;"><i class="fa fa-calendar" aria-hidden="true"></i> '+(moviesList.results[i].release_date).substr(0,4)+'</h3></li>'+
                                                            '<li class="ui-block-b" style="width:75%;"><h3  style="font-weight:lighter; margin-left:2%;">'+GenreString+'</h3></li>'+
                                                        '</ul>'+
                                                        '<div><p class="description_list" >'+moviesList.results[i].overview+'</p></div>'+
                                                        '<div onclick="javascript:isFavorite('+moviesList.results[i].id+',\'webDetail\')" ><i class="fa fa-plus" aria-hidden="true" style="text-align:center;margin-left:45%;margin-top:25%;margin-bottom:25%;font-size:20px;font-weight:bold;"></i></div>'+
                                                    '</li>'+
                                                '</ul>'+
                                                '</li>');
                }
            
            theList.listview("refresh");
            
            });
    
        
    
    

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}