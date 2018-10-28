module.exports = function(sequelize, DataTypes) {
    var Task = sequelize.define("Task", {
        name: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        due_date: {
            type: DataTypes.DATEONLY 
        }, 
        sprint_id: {
            type: DataTypes.INTEGER, 
            allowNull: false
        }, 
        description: {
            type: DataTypes.TEXT
        }, 
        assigned_id:{
            type: DataTypes.INTEGER
        }
    });
    return Task;
}