$(function() {
  const socket = io();

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
    const theMessage = jsonMsg.message;
    const sequenceNumber = jsonMsg.sequence;
    const trimmedHash = "runningHash: " + jsonMsg.runningHash.slice(0,6) + "..";
    const timestamp = jsonMsg.timestamp;
    const txStamp = jsonMsg.timestampNum;

    // const idString = topicId.innerHTML.substring(7, topicId.length);

    $("#messages").append(
      $("<li>").addClass("new-message").append(
        $("<div>").addClass("message").append(
          $("<p>").text(operatorId).addClass("client")).append(
            $("<div>").addClass("message-body").append(
              $("<div>").text(theMessage).addClass("message-content")).append(
              $("<div>").text(timestamp).addClass("message-timestamp")))).append(
        $("<div>").addClass("meta").append(
          $("<p>").text("sequence: "+ sequenceNumber).addClass("details")).append(
          $("<p>").text(trimmedHash).addClass("details")).append(
          $("<a>").text("view transaction").addClass("details")
            .attr("target", "_blank")
            .attr("href", `https://hashscan.io/testnet/transaction/${txStamp}`))));

    $("#sequence-number").text("last message sequence number: " + sequenceNumber + "  ");
  });

  socket.on("connect message", function(msg) {
    const connectMessage = JSON.parse(msg)
    $("#messages").append(
      $("<li>").text('new connection: ' + connectMessage.operatorAccount).addClass("new-connection"));
    const topicId = document.getElementById("topic-id");
    const topicInfo = document.getElementById("topic-info");
    topicId.innerHTML = "Topic: " + connectMessage.topicId;
    topicInfo.setAttribute("href", `https://hashscan.io/testnet/topic/${connectMessage.topicId}`);
    topicInfo.classList.add("topicInfo");
  });

  
  socket.on("disconnect message", function(msg) {
    
    const disconnectMsg = JSON.parse(msg);
    $("#messages").append(
      $("<li>").text(disconnectMsg.operatorAccount).addClass("disconnection"));
  });
});
