<?php

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_logged_out_user()
    {
        $this->visit('/')
             ->see('Log in with Pocket');
    }

    public function test_logged_in_user()
    {
        $this->withSession(['username' => 'testuser'])
             ->visit('/')
             ->see('Logout');
    }

    // TODO Mock Pocket API

}
