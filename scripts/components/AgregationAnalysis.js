import preact from 'preact'

const {h} = preact;

function makeUnusedLigneBudgetSet(documentBudgetaire, agregation){
    return documentBudgetaire.rows.filter(ligneBudget => {
        // a ligneBudget is unused if it's part of no agregation
        return !agregation.some(agg => agg.rows.has(ligneBudget));
    })
}

function makeUsedMoreThanOnceLigneBudgetSet(documentBudgetaire, agregation){
    const aggregationSetsByRow = new Map()

    for(const ligneBudget of documentBudgetaire.rows){
        const aggregationSets = []
        for(const aggLeaf of agregation){
            if(aggLeaf.rows.has(ligneBudget)){
                aggregationSets.push(aggLeaf)
            }
        }

        if(aggregationSets.length >= 2){
            aggregationSetsByRow.set(ligneBudget, aggregationSets)
        }
    }

    return [...aggregationSetsByRow.entries()]
        .map(([row, aggregationSets]) => ({row, aggregationSets}))
}


export default function({agregation, documentBudgetaire}){
    const unusedRows = documentBudgetaire ?
        makeUnusedLigneBudgetSet(documentBudgetaire, agregation).toJS() : 
        [];
    const rowsUsedMoreThanOnce = documentBudgetaire ?
        makeUsedMoreThanOnceLigneBudgetSet(documentBudgetaire, agregation) : 
        [];

    return html`
        <section>
            <h1>Analyse</h1>
            <p>Il y a ${documentBudgetaire && documentBudgetaire.rows.size} lignes dans le document budgetaire</p>
            <p>Il y a ${agregation.length} feuilles d'agrégation</p>

            <h2>Lignes non-utilisées (${unusedRows.length})</h2>
            <table>
                ${
                    unusedRows.map(row => {
                        return html`
                            <tr>
                                <td>${row["CodRD"]}${row["FI"]}</td>
                                <td>F${row["Fonction"]}</td>
                                <td>C${row["Chapitre"]}</td>
                                <td>N${row["Nature"]}</td>
                                <td>${row["MtReal"]}</td>
                            </tr>
                        `
                    })
                }
            </table>

            <h2>Lignes utilisées plus qu'une fois (${rowsUsedMoreThanOnce.length})</h2>
            <table>
                ${
                    rowsUsedMoreThanOnce.map(({row, aggregationSets}) => {
                        return html`
                            <tr>
                                <td>${row["CodRD"]}${row["FI"]} F${row["Fonction"]} C${row["Chapitre"]} N${row["Nature"]}</td>
                                <td>${
                                    aggregationSets.map(({name}) => name).join(' & ')
                                }</td>
                            </tr>
                        `
                    })
                }
            </table>


        </section>
    `
}
