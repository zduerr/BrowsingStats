myApp.factory('dexie', function () {
    var tableData = [{}];

    var dex = {};

    dex.db = new Dexie()


    // //holds the data body templates for the user to send add/edit/delete requests
    // var curSite = {
    //     domain: '',
    //     min: '',
    //     date: ''
    // };
    //
    // //returns collection
    //
    // //post call returns promise of data, used to shorten requests and for clarity
    // function post(url, data) {
    //     return $http.post(url, data).then(function (response) {
    //         return response;
    //     }).catch(function () {
    //         alert('sql error adding/editing data');
    //     });
    // }
    //
    // //pulls the data from the workouts table and updates the client side tableData object
    // function update() {
    //     get('/api/view', {params: {table: 'workouts'}}).then(function (data) {
    //         tableData = data;
    //     }).catch(function () {
    //         alert("error in get call");
    //     });
    // }
    //
    // //reset data body object
    // function reset (d) {
    //     d.name = d.reps = d.weight = '';
    //     d.date = new Date();  //convert back to date object
    //     d.lbs = 1;  //set default value to auto-select lbs in the forms
    //     if (d.hasOwnProperty('id')) {
    //         d.id = -1;
    //     }
    // }
    //
    // //PUBLIC FUNCTIONS
    // //add a new exercise to the workout table
    // Sql.add = function () {
    //     post('/api/add', postData).then(function () {
    //         update();
    //         reset(postData);
    //     }).catch(function () {
    //         alert('error in search');
    //     });
    // };
    //
    // //deletes a row from the table based on the id
    // Sql.deleteById = function (id) {
    //     if (id > 0) {
    //         deleteData.id = id;
    //         post('/api/delete', deleteData).then(function () {
    //             update();
    //         }).catch(function () {
    //             alert("error in get call");
    //         });
    //     }
    // };
    //
    // //edit an existing row in the workouts table
    // Sql.edit = function () {
    //     post('api/edit', editData).then(function () {
    //         update();
    //         reset(editData);
    //     }).catch(function() {
    //         alert('error in edit');
    //     });
    // };
    //
    // //used to prepopulate edit form with existing data in the table
    // Sql.editInit = function(rowData){
    //     editData.name = rowData.name;
    //     editData.reps = rowData.reps;
    //     editData.weight = rowData.weight;
    //     editData.lbs = rowData.lbs;
    //     editData.date = new Date(rowData.date);
    //     editData.id = rowData.id;
    // };
    //
    // Sql.cancel = function(x) {
    //     reset(x);
    // };
    //
    // //getters
    // Sql.getTableData = function () {
    //     return tableData;
    // };
    // Sql.getPostData = function () {
    //     return postData;
    // };
    // Sql.getEditData = function () {
    //     return editData;
    // };


    return Sql;
});