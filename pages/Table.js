import React, { Fragment, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";

export default function Table({ data }) {

    const [tableData, setTableData] = useState();
    const styles = StyleSheet.create({
        estiloTextoFuerte: {
            textAlign: 'center'
        },
        rowView: {
            display: 'flex', flexDirection: 'row', /*borderTop: '1px solid #EEE',*/ paddingTop: 8, paddingBottom: 8, textAlign: "center"
        }
    });

    useEffect(() => {
        if (data !== undefined) setTableData(data);
    }, []);

    return (
        <>
            {tableData &&
                (
                    <Fragment>
                        <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                        <View style={styles.rowView}>
                            {tableData["column"].map((c) => <Text style={{
                                width: `${100 / tableData["column"].length}%`
                            }}>{c.header}</Text>)}
                        </View>
                        <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                        {tableData["detallesRecibo"].map((rowData) => <>
                            <View style={styles.rowView}>
                                {tableData["column"].map((c) =>
                                    <Text style={{ width: `${100 / tableData["column"].length}%` }}>{rowData[c.field]}</Text>
                                )}
                            </View>
                        </>)}
                    </Fragment>
                )}
        </>

    )
}