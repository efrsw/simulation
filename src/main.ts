import cytoscape from 'cytoscape';
import { Graph } from './models/Graph';

(() => {

    let nSimulations = 10;
    let slider = document.getElementById('slider') as HTMLInputElement;
    slider.min = "0";
    slider.max = nSimulations.toString();
    slider.step = "1";
    slider.value = "0";

    let g = new Graph(7, 3, nSimulations);
    let cy = cytoscape({

        container: document.getElementById('app'),

        style: [ // the stylesheet for the graph
            {
                selector: 'node[type="person"]',
                style: {
                    'background-color': 'blue',
                    'label': 'data(id)',
                }
            },
            {
                selector: 'node[type="foci"]',
                style: {
                    'background-color': 'red',
                    'label': 'data(id)',
                    'shape': 'hexagon'
                }
            },
            {
                selector: 'edge[state="present"]',
                style: {
                    'width': 3,
                    'line-color': 'grey',
                    'target-arrow-color': 'grey',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 1
                }
            },
            {
                selector: 'edge[state="possible"]',
                style: {
                    'width': 3,
                    'line-color': 'grey',
                    'target-arrow-color': 'grey',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 1,
                    'line-style': 'dashed'
                }
            },
            {
                selector: 'edge[state="possible-membership"]',
                style: {
                    'width': 3,
                    'line-color': 'orange',
                    'target-arrow-color': 'orange',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 1,
                    'line-style': 'dashed'
                }
            },
            {
                selector: 'edge[state="possible-focal"]',
                style: {
                    'width': 3,
                    'line-color': 'purple',
                    'target-arrow-color': 'purple',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 1,
                    'line-style': 'dashed'
                }
            },
            {
                selector: 'edge[state="possible-triadic"]',
                style: {
                    'width': 3,
                    'line-color': 'green',
                    'target-arrow-color': 'green',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 1,
                    'line-style': 'dashed'
                }
            },
            {
                selector: 'edge[state="absent"]',
                style: {
                    'opacity': 0
                }
            }
        ],

        layout: {
            name: 'grid',
            rows: 1
        }

    });

    g.initializeGraph();

    [...g.people, ...g.foci].forEach(n => {
        cy.add({
            group: 'nodes',
            data: { type: n.type, id: n.id },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
        })
    });

    slider.oninput = _ => {
        cy.elements('edges').remove();
        g.simulations[Number(slider.value)].forEach(l => {
            cy.add({
                data: {
                    id: l.id,
                    source: l.source.id,
                    target: l.target.id,
                    state: l.state
                }
            })
        });
    }

    console.log(g.simulations);

})();

