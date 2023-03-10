$(function() {
  // expose our socket client
  const socket = io();

  // handle and submit new data messages to our server
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    const msg = $("#m").val();
    socket.emit("data message", $("#m").val());
    $("#m").val("");
    return false;
  });

  socket.on("data message", function(msg) {

    const jsonMsg = JSON.parse(msg);
    const operatorId = jsonMsg.operatorAccount;
    // const clientId = jsonMsg.client;
    const theMessage = jsonMsg.message;
    const sequenceNumber = jsonMsg.sequence;
    const trimmedHash = "runningHash: " + jsonMsg.runningHash.slice(0,6) + "..";
    const trimmedTimestamp = jsonMsg.timestamp.slice(0,25);

    const topicId = document.getElementById("topic-id");
    const idString = topicId.innerHTML.substring(7, topicId.length);

    $("#messages").append(
      $("<li>").addClass("new-message").append(
        $("<div>").addClass("message").append(
          $("<p>").text(operatorId).addClass("client")).append(
            $("<div>").addClass("message-body").append(
              $("<div>").text(theMessage).addClass("message-content")).append(
              $("<div>").text(trimmedTimestamp).addClass("message-timestamp")))).append(
        $("<div>").addClass("meta").append(
          $("<p>").text("sequence: "+ sequenceNumber).addClass("details")).append(
          $("<p>").text(trimmedHash).addClass("details")).append(
          $("<a>").text("view transaction").addClass("details")
            .attr("target", "_blank")
            .attr("href", `https://explorer.kabuto.sh/testnet/topic/${idString}/message/${sequenceNumber}`))));

    $("#sequence-number").text("last message sequence number: " + sequenceNumber + "  ");
  });

  socket.on("connect message", function(msg) {
    const connectMessage = JSON.parse(msg)
    $("#messages").append(
      $("<li>").text('Current session logs').addClass("new-connection"));
    const topicId = document.getElementById("topic-id");
    topicId.innerHTML = "Topic: " + connectMessage.topicId;
  });

  // listen for client disconnections from our server
  socket.on("disconnect message", function(msg) {
    /* send new disconnection message */
    const disconnectMsg = JSON.parse(msg);
    $("#messages").append(
      $("<li>").text(disconnectMsg.operatorAccount).addClass("disconnection"));
  });
});
