import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
    xNum: number,
    yData: number[]
}

export function Chart(props: Props) {

    const options = {
        chart: {
            id: 'player-data',
            toolbar: {
                show: true,
                offsetX: 0,
                offsetY: 0,
                tools: {
                    download: false,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                    customIcons: []
                },
                autoSelected: undefined
            },
        },
        xaxis: {
            categories: Array.from({ length: props.xNum }, (_, i) => i + 1)
        }
    }

    const series = [{
        name: 'cps',
        data: props.yData
    }]

    return (
        <>
            <ApexChart
                type="line"
                options={options}
                series={series}
                height={200}
                width={500} 
                className="chart" />
        </>
    )

}