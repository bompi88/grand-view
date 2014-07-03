Template.Tree.rendered = function() {

    var data = [
    {
        label: 'node1',
        text: 'dette er node1 sin tekst',
        children: [
            { 
                label: 'child1',
                text: 'Dette er node1 child1 sin tekst.'
            },
            { 
                label: 'child2',
                text: 'Dette er node1 child2 sin tekst.'
            }
        ]
    },
    {
        label: 'node2',
        text: 'dette er node2 sin tekst',
        children: [
            { 
                label: 'child3' ,
                text: 'dette er node2 child3 sin tekst.'
            }
        ]
    }
    ];

    $('#tree1').tree({
        data: data,
        autoOpen: true,
        dragAndDrop: true
    });

    // bind 'tree.click' event
    $('#tree1').bind(
        'tree.click',
        function(event) {
            // The clicked node is 'event.node'
            var node = event.node;
            console.log(node.text);

            $('#myText').text(node.text);
        }
    );


}