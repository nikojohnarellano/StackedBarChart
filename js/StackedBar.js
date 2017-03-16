/**
 * Create stacked bar object
 * @param {Object} param - an object with the following fields:
 *                          {number} width - the width of the svg element
 *                          {number} height - the height of the svg element
 *                          {string} elem - selector for the element to append the svg element to
 *                          {string} chartTitle - title for the chart
 *                          {string} xAxisLabel - label for the x-Axis
 *                          {string} yAxisLabel - label for the y-Axis
 *                          {string} zAxisLabel - label for the z-Axis
 *                          {object} margin - object with the following fields:
 *                              {number} top - top margin
 *                              {number} right - right margin
 *                              {number} bottom - bottom margin
 *                              {number} left - left margin
 */
var StackedBarChart = function(param)
{
    var width = param.width;
    var height = param.height;
    var elem = param.elem;
    var chartTitle = param.chartTitle;
    var xAxisLabel = param.xAxisLabel;
    var yAxisLabel = param.yAxisLabel;
    var zAxisLabel = param.zAxisLabel;
    var tooltipTitle = param.tooltipTitle;
    var margin = { top: 57, right: 57, bottom: 57, left: 57 };

    var svg = d3.select(elem)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(responsivefy)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var tooltip = d3.select(elem).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    return {
        h: height - margin.top - margin.bottom,
        w: width - margin.left - margin.right,
        svg: svg,

        xScale: null,
        xAxis: null,
        yScale: null,
        yAxis: null,
        zScale: null,
        zAxis: null,
        addLine: null,
        layers: null,
        colors: null,
        dateFormatString: null,
        dataLength: null,

        /**
         * Set the scales for the chart based on the data and it's domain
         * @param {number[]} xDom - array of two numbers representing min and max values of the x domain
         * @param {number[]} yDom - array of two numbers representing min and max values of the y domain
         * @param data - parsed data from the input json
         */
        setScales: function(data)
        {
          var that = this;

          that.xScale = d3.scale.ordinal()
              .rangeRoundBands([0, that.w], 0.3);

          that.yScale = d3.scale.linear()
              .rangeRound([that.h, 0]);

          that.colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574"];

          // TODO make the number of yvals dynamic
          that.layers = d3.layout.stack()(["yval1", "yval2", "yval3"].map(function(yval) {
                return data.map(function(d) {
                    return {x: d.xval, y: +d[yval]};
                });
          }));

          that.xScale.domain(that.layers[0].map(function(d) { return d.x; }));
          that.yScale.domain([0, d3.max(that.layers[that.layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

          that.yAxis = d3.svg.axis()
                            .scale(that.yScale)
                            .orient("left")
          ;

          that.xAxis = d3.svg.axis()
                            .scale(that.xScale)
                            .orient("bottom")
          ;
        },

        /**
         * Initializes the chart. Sets the scales and generates the axes and grid lines.
         * @param {number[]} xDom - array of two numbers representing min and max values of the x domain
         * @param {number[]} yDom - array of two numbers representing min and max values of the y domain
         * @param data - parsed data from the input json
         */
        initChart: function(data)
        {
          var that = this;
          that.setScales(data);

          svg.append("g")
                    .attr("class", "y axis")
                    .call(that.yAxis);

          svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + that.h + ")")
                    .call(that.xAxis);

        },

        /**
         * Helper function. Deletes old bar elements after they are shrunk to zero (For animation pruposes, the bars are shrunk to zero instead of being instantly removed).
         */
        deleteGarbage: function()
        {
            d3.selectAll(".toBeDeleted").remove();
        },

        /**
         * Updates the chart based on the data passed in.
         * @param data - parsed data from input json
         */
        updateChart: function()
        {
          var that = this;
          var layer = svg.selectAll(".layer")
              .data(that.layers)
            .enter().append("g")
              .attr("class", "layer")
              .style("fill", function(d, i) { return that.colors[i]; });

          layer.selectAll("rect")
              .data(function(d) { return d; })
            .enter().append("rect")
              .attr("x", function(d) { return that.xScale(d.x); })
              .attr("y", function(d) { return that.yScale(d.y + d.y0); })
              .attr("height", function(d) { return that.yScale(d.y0) - that.yScale(d.y + d.y0); })
              .attr("width", that.xScale.rangeBand() - 1);
        },

        /**
         * Checks if a string represents a date
         * @param {string} the string to check
         * @returns {bool} whether the string is a date or not
         */
        isDate: function(data)
        {
            var dateFormat = "MMM-DD-YYYY";
            return moment(data, dateFormat, false).isValid();
        },

        /**
         * Returns a date object for a string
         * @param {string} the string to get a date for
         * @returns {object} a date object representing the string
         */
        toDate: function(date)
        {
            var dateFormat = "MMM-DD-YYYY";
            return moment(date, dateFormat, false);
        },

        /**
         * Does some processing for json data. Groups year-months together or year-month-days together.
         * Takes the aggregate z-axis values and average y-axis values for each group.
         * @param data - parsed data from input json
         * @returns processed data
         */

        setStackedBarChartData : function(data)
        {
              var that = this;
        }
    };
};
