class Bucket{
    constructor(delay, max){
        this._allowance = 0;

        this.delay = delay;
        this.max = max;

        this.lastCheck = Date.now();
    }

    get allowance () {
        this._allowance += (Date.now() - this.lastCheck) / this.delay;

        this.lastCheck = Date.now();

        if(this._allowance > this.max) this._allowance = this.max;

        return this._allowance
    }

    set allowance(c){
        this._allowance = c;
    }

    spend(count){
        if(this.delay === 0) return true;
        
        let allow = this.allowance;

        if(allow < count) return false;

        this.allowance  = allow - count;

        return true
    }
}

module.exports = Bucket