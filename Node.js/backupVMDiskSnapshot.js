exports.run_process = (req, res) => {
  let message = req.query.message || req.body.message || 'Hello World!';

  console.log(message);

  const Compute = require('@google-cloud/compute');
  const compute = new Compute();
  const zone = compute.zone('us-east1-b');

  //Get all snapshots and delete the once that are older than 14 days
  compute.getSnapshots(function(err, snapshot) {
    snapshot.map(snapshot => { 
      //Date snapshot was created  
      var date1 = new Date(snapshot.metadata.creationTimestamp);
      //Current date
      var date2 = new Date();
      //Calcualted differnece in days between days
      var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24)); //gives day difference 
      //one_day means 1000*60*60*24
      //one_hour means 1000*60*60
      //one_minute means 1000*60
      //one_second means 1000
        
      if (diffDays > 14){
          //Snapshot is older than 14 days
          //Delete the snapshot
          snapshot.delete();
          console.log("The snapshot has been deleted")
      }
      else
      {
          //Snapshot is not old enough
          //Just log the datails in the log
          console.log("The snapshot is not old")
      }
    });
  });

  //Get currnet date time-stamp to append in new snapshot name
  var datetime = new Date().toLocaleDateString();

  zone.getDisks(function(err, disks) {
    disks.map(disk => { 

      //Generate new name for your snapshot  
      var new_snapshot_name = disk.name + "-" + datetime;
      
      //Replace / with - to match regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'
      new_snapshot_name = new_snapshot_name.replace(/\//g, '-');
      console.log(new_snapshot_name);
      
      //Create a new snapshot 
      const getDisk = zone.disk(disk.name);
      const new_snapshot = getDisk.snapshot(new_snapshot_name);
      new_snapshot.create();
    });
  });

  res.status(200).send(message);
};
